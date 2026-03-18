import { useMemo } from "react";
import { Text, View } from "react-native";
import { PALETTE } from "../../theme";
import Avatar from "../Avatar";
import styles from "./style";

export type Props = {
	name: string;
	timestamp: string;
	status: string;
	text: string;
	isMe?: boolean;
	isOnline?: boolean;
}

const timeFormatter = new Intl.DateTimeFormat('default', {
	hour: "2-digit",
	minute: "2-digit",
});
const dateFormatter = new Intl.DateTimeFormat('default', {
	month: "short",
	day: "2-digit",
});

export default function Bubble({ name, timestamp, status, text, isMe, isOnline }: Props) {
	const dynamicStyles = useMemo(() => ({
		container: {
			alignSelf: isMe ? "flex-end" as const : "flex-start" as const,
			flexDirection: isMe ? "row-reverse" as const : "row" as const,
		},
		bubble: {
			backgroundColor: isMe ? PALETTE.Light.Secondary : PALETTE.Light.Surface,
		},
	}), [isMe]);
	let sentDateString = "";
	try {
		const sentDate = new Date(timestamp);
		const today = new Date();
		if (sentDate.toDateString() !== today.toDateString()) {
			sentDateString += dateFormatter.format(sentDate) + ", ";
		}
		sentDateString += timeFormatter.format(sentDate);
	} catch (e) {}

	return (
		<View style={[styles.container, dynamicStyles.container]}>
			<Avatar name={name} isOnline={isOnline} />
			<View style={[styles.bubble, dynamicStyles.bubble]}>
				<Text style={styles.name}>{name}</Text>
				<Text>{text}</Text>
				<View style={styles.meta}>
					<Text style={styles.metaDate}>{sentDateString}</Text>
				</View>
			</View>
		</View>
	);
}
