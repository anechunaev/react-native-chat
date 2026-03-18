import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { PALETTE } from "../../theme";
import styles from "./style";

const getAnimationLoop = ({ count, delay, amplitude, duration }: Record<string, number>) =>
	(anim: Animated.Value, n: number) => Animated.loop(
		Animated.sequence([
			...Array.from({ length: count }, (_, i) =>
				n <= i
					? Animated.delay(delay)
					: null
			).filter(Boolean) as Animated.CompositeAnimation[],
			Animated.timing(anim, {
				toValue: -amplitude,
				duration: duration,
				useNativeDriver: true,
			}),
			Animated.timing(anim, {
				toValue: 0,
				duration: duration,
				useNativeDriver: true,
			}),
			...Array.from({ length: count }, (_, i) =>
				n > i
					? Animated.delay(delay)
					: null
			).filter(Boolean) as Animated.CompositeAnimation[],
		])
	);


export type Props = {
	count?: number;
	size?: number;
	color?: string;
	margin?: number;
	delay?: number;
	amplitude?: number;
	duration?: number;
}

export default function WaveIndicator(props: Props) {
	const {
		count = 3,
		size = 5,
		color = PALETTE.Light.OnSurface,
		margin = 2,
		delay = 100,
		amplitude = 2,
		duration = 200,
	} = props;
	const animRefs = useRef<Animated.Value[]>([]);
	if (animRefs.current.length !== count) {
		animRefs.current = Array.from({ length: count }, () => new Animated.Value(0));
	}
	const animations = animRefs.current;

	useEffect(() => {
		Animated.parallel(animations.map(getAnimationLoop({
			count,
			delay,
			amplitude,
			duration,
		}))).start();
	}, []);

	return (
		<View style={styles.container}>
			{animations.map((anim, index) => (
				<Animated.View
					key={index}
					style={{
						width: size,
						height: size,
						borderRadius: size / 2,
						backgroundColor: color,
						marginHorizontal: margin,
						transform: [{ translateY: anim }],
					}}
				/>
			))}
		</View>
	);
}
