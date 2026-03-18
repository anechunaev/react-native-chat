import { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, TextInput } from "react-native";
import Button from "../components/Button";
import { useServices } from "../services/context";
import { STYLES as THEME_STYLES } from "../theme";

export default function Index() {
	const { auth, setIsLoggedInGuard } = useServices();
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		setError("");
		setLoading(true);
		try {
			await auth.logIn(name);
			setIsLoggedInGuard(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={[THEME_STYLES.container, styles.container]}
			behavior="padding"
			keyboardVerticalOffset={110}
		>
			<Text>Enter your name:</Text>
			<TextInput
				style={THEME_STYLES.textInput}
				value={name}
				onChangeText={setName}
				placeholder="Name"
				editable={!loading}
			/>
			{error ? <Text style={THEME_STYLES.errorText}>{error}</Text> : null}
			<Button onPress={handleLogin} disabled={loading}>
				{loading ? "Logging in..." : "Log In"}
			</Button>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		gap: 10,
	},
});
