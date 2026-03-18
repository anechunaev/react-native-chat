import { StyleSheet } from "react-native";
import PALETTE from "./palette";

const STYLES = StyleSheet.create({
	textInput: {
		borderWidth: 1,
		backgroundColor: PALETTE.Light.Surface,
		borderColor: PALETTE.Light.SurfaceVariant,
		borderRadius: 4,
		padding: 10,
		minWidth: 200,
	},
	button: {
		backgroundColor: PALETTE.Light.Primary,
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 4,
	},
	buttonText: {
		color: PALETTE.Light.OnPrimary,
		fontWeight: "bold",
	},
	errorText: {
		color: PALETTE.Light.Error,
	},
	container: {
		flex: 1,
		backgroundColor: PALETTE.Light.Background,
		justifyContent: "center",
		alignItems: "center",
	}
});

export default STYLES;
