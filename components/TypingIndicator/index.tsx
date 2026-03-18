import { Text, View } from "react-native";
import WaveIndicator from "../WaveIndicator";
import styles from "./style";

export type Props = {
	users: string[];
}

export default function TypingIndicator({ users }: Props) {
	if (users.length === 0) {
		return null;
	}

	return (
		<View style={styles.container}>
			<WaveIndicator />
			<Text style={styles.text}>
				{users.join(', ')} {users.length === 1 ? 'is' : 'are'} typing...
			</Text>
		</View>
	);
}
