import { useMemo } from "react";
import { Text, View } from "react-native";
import { COLORS, PALETTE } from '../../theme';
import styles from "./style";

function hash16(input: string): number {
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = (hash * 31 + input.charCodeAt(i)) | 0;
	}
	return (hash >>> 0) % 16;
}
function hashColor(input: string): string {
	const nibble = hash16(input);
	return Object.values(COLORS.Illustrations)[nibble];
}

function getContrastColor(hex: string): string {
	const cleanHex = hex.replace("#", "");

	const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
	const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
	const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

	const toLinear = (c: number) =>
		c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

	const R = toLinear(r);
	const G = toLinear(g);
	const B = toLinear(b);

	const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;

	const contrastWhite = (1.05) / (luminance + 0.05);
	const contrastBlack = (luminance + 0.05) / 0.05;

	return contrastWhite > contrastBlack ? COLORS.UI.White : COLORS.UI.Black;
}

export type Props = {
	name: string;
	isOnline?: boolean;
}

export default function Avatar({ name, isOnline }: Props) {
	const nameColor = hashColor(name);
	const textColor = getContrastColor(nameColor);
	const dynamicStyles = useMemo(() => ({
		container: {
			backgroundColor: nameColor,
			outlineColor: isOnline ? PALETTE.Light.Success : PALETTE.Light.SurfaceVariant,
		},
		text: {
			color: textColor,
		},
	}), [nameColor, textColor, isOnline]);
	return (
		<View style={[styles.container, dynamicStyles.container]}>
			<Text style={[styles.text, dynamicStyles.text]}>
				{name.split(" ").map(s => s[0]).join("")}
			</Text>
		</View>
	);
}
