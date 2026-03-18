import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import AppAuth from "./auth";
import DatabaseService from "./database";
import StatusService from "./status";

type ServiceContextType = {
	db: DatabaseService;
	auth: AppAuth;
	status: StatusService;
	isLoggedInGuard: boolean;
	setIsLoggedInGuard: (value: boolean) => void;
	isRestoringSession: boolean;
};

const ServiceContext = createContext<ServiceContextType | null>(null);

export function ServiceProvider({ children }: { children: ReactNode }) {
	const dbRef = useRef(new DatabaseService());
	const authRef = useRef(new AppAuth(dbRef.current));
	const statusRef = useRef(new StatusService(dbRef.current));
	const [isLoggedInGuard, setIsLoggedInGuard] = useState(false);
	const [isRestoringSession, setIsRestoringSession] = useState(true);

	// Restore persisted session on mount
	useEffect(() => {
		const restore = async () => {
			const auth = authRef.current;
			try {
				const name = await auth.restoreSession();
				if (name) {
					try {
						await auth.goOnline();
						setIsLoggedInGuard(true);
					} catch (err) {
						console.error("Failed to go online after session restore:", err);
					}
				}
			} catch (err) {
				console.error("Failed to restore session:", err);
			} finally {
				setIsRestoringSession(false);
			}
		};
		restore();
	}, []);

	// Handle AppState changes for online/offline
	useEffect(() => {
		if (!isLoggedInGuard) return;

		const auth = authRef.current;
		const subscription = AppState.addEventListener("change", (nextState) => {
			if (nextState === "active") {
				auth.goOnline().catch((err) => {
					console.error("Failed to go online:", err);
				});
			} else if (nextState === "background" || nextState === "inactive") {
				auth.goOffline().catch((err) => {
					console.error("Failed to go offline:", err);
				});
			}
		});

		return () => subscription.remove();
	}, [isLoggedInGuard]);

	return (
		<ServiceContext.Provider
			value={{
				db: dbRef.current,
				auth: authRef.current,
				status: statusRef.current,
				isLoggedInGuard,
				setIsLoggedInGuard,
				isRestoringSession,
			}}
		>
			{children}
		</ServiceContext.Provider>
	);
}

export function useServices(): ServiceContextType {
	const context = useContext(ServiceContext);
	if (!context) {
		throw new Error("useServices must be used within a ServiceProvider");
	}
	return context;
}
