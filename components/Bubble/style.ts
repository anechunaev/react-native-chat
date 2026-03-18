import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
	container: {
		alignItems: "flex-start",
		padding: 10,
		maxWidth: "80%",
		gap: 10,
	},
	bubble: {
		padding: 10,
		borderRadius: 10,
		width: "100%",
	},
	name: {
		fontWeight: "bold",
	},
	meta: {
		marginTop: 5,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	metaDate: {
		fontSize: 12,
		opacity: 0.6,
		fontStyle: "italic",
	},
});

export default styles;
