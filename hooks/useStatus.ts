import { useCallback, useEffect, useRef, useState } from "react";
import { useServices } from "../services/context";

export type UseStatusReturn = {
	onlineUsers: string[];
	typingUsers: string[];
	notifyTyping: () => void;
	clearTyping: () => void;
};

export function useStatus(roomId: string): UseStatusReturn {
	const { status, auth } = useServices();
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	const [typingUsers, setTypingUsers] = useState<string[]>([]);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;

		const unsubOnline = status.subscribeToOnlineUsers(
			(users) => {
				if (isMountedRef.current) setOnlineUsers(users);
			},
			(err) => console.error("Online status subscription error:", err),
		);

		const unsubTyping = status.subscribeToTypingUsers(
			roomId,
			(users) => {
				if (!isMountedRef.current) return;
				const self = auth.getUserName();
				setTypingUsers(self ? users.filter((u) => u !== self) : users);
			},
			(err) => console.error("Typing status subscription error:", err),
		);

		return () => {
			isMountedRef.current = false;
			unsubOnline();
			unsubTyping();
			const userName = auth.getUserName();
			if (userName) {
				status.clearTyping(roomId, userName).catch(() => {});
			}
		};
	}, [roomId, status, auth]);

	const notifyTyping = useCallback(() => {
		const userName = auth.getUserName();
		if (!userName) return;
		status.notifyTyping(roomId, userName).catch((err) =>
			console.error("Failed to notify typing:", err),
		);
	}, [roomId, status, auth]);

	const clearTyping = useCallback(() => {
		const userName = auth.getUserName();
		if (!userName) return;
		status.clearTyping(roomId, userName).catch((err) =>
			console.error("Failed to clear typing:", err),
		);
	}, [roomId, status, auth]);

	return { onlineUsers, typingUsers, notifyTyping, clearTyping };
}
