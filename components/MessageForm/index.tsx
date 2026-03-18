import { TextInput, View } from "react-native";
import { STYLES as THEME_STYLES } from "../../theme";
import Button from "../Button";
import styles from "./style";

export type Props = {
	defaultText: string;
	onChange: (text: string) => void;
	onSubmit: () => void;
}

export default function MessageForm({ defaultText, onChange, onSubmit }: Props) {
	return (
		<View style={styles.container}>
			<TextInput
				style={[THEME_STYLES.textInput, styles.input]}
				value={defaultText}
				onChangeText={onChange}
				placeholder="Type a message..."
				onSubmitEditing={onSubmit}
				returnKeyType="send"
			/>
			<Button onPress={onSubmit}>
				Send
			</Button>
		</View>
	)
}
