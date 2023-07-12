import { Spring, useMotor, useViewport } from "@rbxts/pretty-react-hooks";
import { useSelectorCreator } from "@rbxts/react-reflex";
import Roact, { useEffect } from "@rbxts/roact";
import { Group } from "client/app/common/group";
import { useRem } from "client/app/hooks";
import { getSnakeSkin } from "shared/data/skins";
import { describeSnakeFromScore, selectSnakeById } from "shared/store/snakes";
import { SNAKE_ON_SCREEN_MARGIN } from "./constants";
import { SnakeHead } from "./snake-head";
import { SnakeSegment } from "./snake-segment";

interface SnakeProps {
	readonly id: string;
	readonly offset: Vector2;
	readonly scale: number;
}

export function Snake({ id, offset, scale }: SnakeProps) {
	const rem = useRem();
	const viewport = useViewport();
	const snake = useSelectorCreator(selectSnakeById, id);
	const [smoothOffset, setSmoothOffset] = useMotor({ x: offset.X, y: offset.Y });

	useEffect(() => {
		setSmoothOffset({
			x: new Spring(offset.X),
			y: new Spring(offset.Y),
		});
	}, [offset]);

	if (!snake) {
		return <></>;
	}

	const skin = getSnakeSkin(snake.skin);
	const { radius } = describeSnakeFromScore(snake.score);

	const isOnScreen = (segment: Vector2) => {
		const margin = new Vector2(SNAKE_ON_SCREEN_MARGIN, SNAKE_ON_SCREEN_MARGIN).mul(rem);
		const screen = viewport.getValue().add(margin.mul(2));
		const positionNotCentered = segment.mul(rem * scale).add(offset.mul(rem * scale));
		const position = positionNotCentered.add(screen.mul(0.5));

		return position.X >= 0 && position.X <= screen.X && position.Y >= 0 && position.Y <= screen.Y;
	};

	return (
		<Group
			position={smoothOffset.map((offset) => new UDim2(0.5, offset.x * rem * scale, 0.5, offset.y * rem * scale))}
		>
			<SnakeHead
				key="head"
				size={radius * 2 * scale}
				position={snake.head.mul(scale)}
				angle={snake.angle}
				targetAngle={snake.targetAngle}
				skin={skin}
				boost={snake.boost}
			/>

			{snake.segments.mapFiltered((segment, index) => {
				const previous = snake.segments[index - 1] || snake.head;
				const middle = segment.add(previous).div(2);

				if (!isOnScreen(middle)) {
					return;
				}

				return (
					<SnakeSegment
						key={`segment-${index}`}
						size={radius * 2 * scale}
						from={segment.mul(scale)}
						to={previous.mul(scale)}
						index={index}
						skin={skin}
						boost={snake.boost}
					/>
				);
			})}
		</Group>
	);
}
