import type { ComponentProps } from "react";
import { Pressable, Text } from "react-native";
import { STYLES } from "../../theme";

export type Props = {
}

export default function Button({ children, ...rest }: Props & ComponentProps<typeof Pressable>) {
	const content = typeof children === "function" ? null : children;
	return (
		<Pressable style={STYLES.button} {...rest}>
			<Text style={STYLES.buttonText}>{content}</Text>
		</Pressable>
	);
}
