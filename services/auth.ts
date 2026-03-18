import AsyncStorage from "@react-native-async-storage/async-storage";
import type DatabaseService from "./database";
import { arrayRemove, arrayUnion, ONLINE_STATUS_DOC } from "./database";

const USERNAME_KEY = "userName";

export default class AppAuth {
	private userName: string | null = null;

	constructor(private db: DatabaseService) {}

	public validateName(name: string): boolean {
		return name.trim().length > 0;
	}

	public async logIn(name: string, force = false): Promise<void> {
		if (!this.validateName(name)) {
			throw new Error("Name cannot be empty");
		}

		if (!force) {
			const statusDoc = await this.db.getDocument(ONLINE_STATUS_DOC);
			const onlineUsers = (statusDoc?.online as string[]) ?? [];

			if (onlineUsers.includes(name)) {
				throw new Error(`"${name}" is already online`);
			}
		}

		await this.db.updateDocument(ONLINE_STATUS_DOC, {
			online: arrayUnion(name),
		});

		this.userName = name;
		await AsyncStorage.setItem(USERNAME_KEY, name);
	}

	public async logOut(): Promise<void> {
		await this.goOffline();
		this.userName = null;
		await AsyncStorage.removeItem(USERNAME_KEY);
	}

	public async goOnline(): Promise<void> {
		if (this.userName === null) return;

		await this.db.updateDocument(ONLINE_STATUS_DOC, {
			online: arrayUnion(this.userName),
		});
	}

	public async goOffline(): Promise<void> {
		if (this.userName === null) return;

		await this.db.updateDocument(ONLINE_STATUS_DOC, {
			online: arrayRemove(this.userName),
		});
	}

	public async restoreSession(): Promise<string | null> {
		const name = await AsyncStorage.getItem(USERNAME_KEY);
		if (name) {
			this.userName = name;
		}
		return name;
	}

	public getUserName(): string | null {
		return this.userName;
	}
}
