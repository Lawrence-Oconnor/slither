import { useEventListener } from "@rbxts/pretty-react-hooks";
import { useSelector } from "@rbxts/react-reflex";
import Roact, { useBinding, useEffect, useMemo } from "@rbxts/roact";
import { RunService } from "@rbxts/services";
import { Frame } from "client/app/common/frame";
import { Shadow } from "client/app/common/shadow";
import { useMotion, useRem } from "client/app/hooks";
import { MenuPage, selectCurrentPage } from "client/store/menu";
import { map } from "shared/utils/math-utils";

import { MIN_NAV_REM } from "./constants";

interface IndicatorProps {
	readonly colors: readonly Color3[];
	readonly order: readonly MenuPage[];
	readonly edge: "top" | "bottom";
}

export function Indicator({ colors, order, edge }: IndicatorProps) {
	const rem = useRem({ minimum: MIN_NAV_REM });

	const page = useSelector(selectCurrentPage);
	const currentIndex = order.indexOf(page);
	const currentColor = colors[currentIndex];

	const [color, colorMotion] = useMotion(Color3.fromRGB(255, 255, 255));
	const [position, positionMotion] = useMotion(0);
	const [velocity, setVelocity] = useBinding(0);

	const style = useMemo(() => {
		return {
			position: position.map((x) => {
				return edge === "top"
					? new UDim2(0.5, math.round(rem(x)), 0, 0)
					: new UDim2(0.5, math.round(rem(x)), 1, 0);
			}),
			size: velocity.map((x) => new UDim2(0, math.round(rem(x + 4)), 0, rem(1))),
		};
	}, [edge, rem]);

	useEffect(() => {
		const x = map(currentIndex, 0, 2, -8, 8);
		positionMotion.spring(x);
	}, [page, rem]);

	useEffect(() => {
		colorMotion.spring(currentColor);
	}, [currentColor]);

	useEventListener(RunService.Heartbeat, () => {
		const velocity = math.abs(positionMotion.getVelocity());
		setVelocity(50 * velocity);
	});

	return (
		<Frame
			backgroundColor={color}
			cornerRadius={new UDim(0.5, 0)}
			anchorPoint={new Vector2(0.5, 0.5)}
			size={style.size}
			position={style.position}
		>
			<Shadow
				key="glow"
				shadowPosition={rem(0)}
				shadowSize={rem(0)}
				shadowColor={color}
				shadowTransparency={0.8}
			/>
		</Frame>
	);
}
