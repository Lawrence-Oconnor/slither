import { blend } from "@rbxts/pretty-react-hooks";
import Roact, { useMemo } from "@rbxts/roact";
import { palette } from "shared/data/palette";

import { useRem } from "../hooks";
import { composeBindings } from "../utils/compose-bindings";
import { Group } from "./group";

interface OutlineProps extends Roact.PropsWithChildren {
	readonly outlineTransparency?: number | Roact.Binding<number>;
	readonly innerColor?: Color3 | Roact.Binding<Color3>;
	readonly outerColor?: Color3 | Roact.Binding<Color3>;
	readonly innerTransparency?: number | Roact.Binding<number>;
	readonly outerTransparency?: number | Roact.Binding<number>;
	readonly innerThickness?: number | Roact.Binding<number>;
	readonly outerThickness?: number | Roact.Binding<number>;
	readonly cornerRadius?: UDim | Roact.Binding<UDim>;
}

export function Outline({
	outlineTransparency = 0,
	innerColor = palette.white,
	outerColor = palette.black,
	innerTransparency = 0.9,
	outerTransparency = 0.85,
	innerThickness,
	outerThickness,
	cornerRadius,
	children,
}: OutlineProps) {
	const rem = useRem();

	innerThickness ??= rem(3, "pixel");
	outerThickness ??= rem(1.5, "pixel");
	cornerRadius ??= new UDim(0, rem(0.5));

	const innerStyle = useMemo(() => {
		const size = composeBindings(innerThickness!, (thickness) => {
			return new UDim2(1, math.round(-2 * thickness), 1, math.round(-2 * thickness));
		});

		const position = composeBindings(innerThickness!, (thickness) => {
			return new UDim2(0, thickness, 0, thickness);
		});

		const radius = composeBindings(cornerRadius!, innerThickness!, (radius, thickness) => {
			return radius.sub(new UDim(0, thickness));
		});

		const transparency = composeBindings(outlineTransparency, innerTransparency, (a, b) => {
			return math.clamp(blend(a, b), 0, 1);
		});

		return { size, position, radius, transparency };
	}, [innerThickness, innerTransparency, cornerRadius, outlineTransparency, rem]);

	const outerStyle = useMemo(() => {
		const transparency = composeBindings(outlineTransparency, outerTransparency, (a, b) => {
			return math.clamp(blend(a, b), 0, 1);
		});

		return { transparency };
	}, [outlineTransparency, outerTransparency]);

	return (
		<>
			<Group key="inner-border" size={innerStyle.size} position={innerStyle.position}>
				<uicorner key="border-radius" CornerRadius={innerStyle.radius} />
				<uistroke
					key="border"
					Color={innerColor}
					Transparency={innerStyle.transparency}
					Thickness={innerThickness}
				>
					{children}
				</uistroke>
			</Group>

			<Group key="outer-border">
				<uicorner key="border-radius" CornerRadius={cornerRadius} />
				<uistroke
					key="border"
					Color={outerColor}
					Transparency={outerStyle.transparency}
					Thickness={outerThickness}
				>
					{children}
				</uistroke>
			</Group>
		</>
	);
}
