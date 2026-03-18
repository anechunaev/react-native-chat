import { StyleSheet } from "react-native";
import { PALETTE } from "../../theme";

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		gap: 10,
		backgroundColor: PALETTE.Light.Surface,
		borderTopColor: PALETTE.Light.SurfaceVariant,
		borderTopWidth: 1,
		width: "100%",
	},
	input: {
		flexGrow: 1,
	},
});

export default styles;
