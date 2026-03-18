import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { ServiceProvider, useServices } from "../services/context";
import { STYLES } from "../theme";

function NavigationGuard() {
	const { isLoggedInGuard, isRestoringSession } = useServices();

	if (isRestoringSession) {
		return (
			<View style={STYLES.container}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<Stack>
			<Stack.Protected guard={isLoggedInGuard}>
				<Stack.Screen name="chat" options={{ title: "Chat" }} />
			</Stack.Protected>
			<Stack.Protected guard={!isLoggedInGuard}>
				<Stack.Screen name="index" options={{ title: "Login" }} />
			</Stack.Protected>
		</Stack>
	);
}

export default function RootLayout() {
	return (
		<ServiceProvider>
			<NavigationGuard />
		</ServiceProvider>
	);
}
