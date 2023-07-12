import { map } from "@rbxts/pretty-react-hooks";
import { createProducer } from "@rbxts/reflex";
import { lerpRadians } from "shared/utils/math-utils";
import { mapObject } from "shared/utils/object-utils";
import { SNAKE_BOOST_SPEED, SNAKE_SPEED, describeSnakeFromScore } from "./snake-utils";

export interface SnakesState {
	readonly [id: string]: SnakeEntity | undefined;
}

export interface SnakeEntity {
	readonly id: string;
	readonly name: string;
	readonly head: Vector2;
	readonly angle: number;
	readonly targetAngle: number;
	readonly score: number;
	readonly boost: boolean;
	readonly segments: readonly Vector2[];
	readonly skin: string;
}

const initialState: SnakesState = {};

const initialSnake: SnakeEntity = {
	id: "",
	name: "",
	head: new Vector2(),
	angle: 0,
	targetAngle: 0,
	score: 0,
	boost: false,
	segments: [],
	skin: "",
};

export const snakesSlice = createProducer(initialState, {
	addSnake: (state, id: string, name: string, head: Vector2, skin: string) => ({
		...state,
		[id]: { ...initialSnake, id, name, head, skin },
	}),

	removeSnake: (state, id: string) => ({
		...state,
		[id]: undefined,
	}),

	updateSnakes: (state, deltaTime: number) => {
		return mapObject(state, (snake) => {
			const {
				turnSpeed,
				segments: targetSegmentCount,
				spacingAtHead,
				spacingAtTail,
			} = describeSnakeFromScore(snake.score);

			const angle = lerpRadians(snake.angle, snake.targetAngle, turnSpeed * deltaTime);
			const speed = snake.boost ? SNAKE_BOOST_SPEED : SNAKE_SPEED;
			const head = snake.head.add(new Vector2(math.cos(angle), math.sin(angle)).mul(speed * deltaTime));

			const currentSegmentCount = snake.segments.size();
			const segments = snake.segments.mapFiltered((segment, index) => {
				if (index >= targetSegmentCount) {
					return;
				}

				const previous = snake.segments[index - 1] || snake.head;

				// as the index approaches the end of the snake, the
				// segments should be further apart
				const spacing = map(index, 0, targetSegmentCount, spacingAtHead, spacingAtTail);

				// interpolate towards the previous segment
				segment = segment.Lerp(previous, (speed * deltaTime) / spacing);

				return segment;
			});

			if (currentSegmentCount < targetSegmentCount) {
				// grow the snake by adding segments to the tail
				const tail = segments[segments.size() - 1] || head;

				for (const _ of $range(currentSegmentCount, targetSegmentCount)) {
					segments.push(tail);
				}
			}

			return { ...snake, head, angle, segments };
		});
	},

	setSnakeTargetAngle: (state, id: string, targetAngle: number) => {
		const snake = state[id];

		if (!snake) {
			return state;
		}

		return {
			...state,
			[id]: { ...snake, targetAngle },
		};
	},

	setSnakeBoost: (state, id: string, boost: boolean) => {
		const snake = state[id];

		if (!snake) {
			return state;
		}

		return {
			...state,
			[id]: { ...snake, boost },
		};
	},

	updateSnake: (state, id: string, intersection: Partial<SnakeEntity>) => {
		const snake = state[id];

		if (!snake) {
			return state;
		}

		return {
			...state,
			[id]: { ...snake, ...intersection },
		};
	},

	incrementSnakeScore: (state, id: string, amount: number) => {
		const snake = state[id];

		if (!snake) {
			return state;
		}

		return {
			...state,
			[id]: { ...snake, score: snake.score + amount },
		};
	},
});
