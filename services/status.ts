import type DatabaseService from "./database";
import { arrayRemove, arrayUnion, ONLINE_STATUS_DOC, ROOT_COLLECTION, type DocumentData } from "./database";

const TYPING_TIMEOUT_MS = 3000;

export default class StatusService {
	private typingTimers: Map<string, number> = new Map();

	constructor(private db: DatabaseService) {}

	public subscribeToOnlineUsers(
		onChange: (users: string[]) => void,
		onError?: (error: unknown) => void,
	): () => void {
		return this.db.subscribeToDocument(
			ONLINE_STATUS_DOC,
			(data: DocumentData | null) => {
				const online = (data?.online as string[]) ?? [];
				onChange(online);
			},
			onError,
		);
	}

	public subscribeToTypingUsers(
		roomId: string,
		onChange: (users: string[]) => void,
		onError?: (error: unknown) => void,
	): () => void {
		return this.db.subscribeToDocument(
			this.getTypingDocPath(roomId),
			(data: DocumentData | null) => {
				const users = (data?.typing as string[]) ?? [];
				onChange(users);
			},
			onError,
		);
	}

	public async notifyTyping(roomId: string, userName: string): Promise<void> {
		await this.db.setDocument(this.getTypingDocPath(roomId), {
			typing: arrayUnion(userName),
		});
		this.scheduleTypingRemoval(roomId, userName);
	}

	public async clearTyping(roomId: string, userName: string): Promise<void> {
		this.clearTypingTimer(roomId);
		await this.db.setDocument(this.getTypingDocPath(roomId), {
			typing: arrayRemove(userName),
		});
	}

	private getTypingDocPath(roomId: string): string[] {
		return [ROOT_COLLECTION, "chats", "rooms", roomId];
	}

	private scheduleTypingRemoval(roomId: string, userName: string): void {
		this.clearTypingTimer(roomId);
		const timer = setTimeout(() => {
			this.typingTimers.delete(roomId);
			this.db.setDocument(this.getTypingDocPath(roomId), {
				typing: arrayRemove(userName),
			}).catch(() => {});
		}, TYPING_TIMEOUT_MS);
		this.typingTimers.set(roomId, timer);
	}

	private clearTypingTimer(roomId: string): void {
		const existing = this.typingTimers.get(roomId);
		if (existing !== undefined) {
			clearTimeout(existing);
			this.typingTimers.delete(roomId);
		}
	}
}
