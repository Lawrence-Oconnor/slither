import { store } from "server/store";
import {
	candyGrid,
	createCandy,
	getSafePointInWorld,
	onCandyTick,
	onCollisionTick,
	onSnakeTick,
	snakeGrid,
} from "server/world";
import { CANDY_LIMITS, WORLD_BOUNDS } from "shared/constants";
import { benchmark } from "shared/utils/benchmark";
import { fillArray } from "shared/utils/object-utils";
import { disconnectAllSchedulers } from "shared/utils/scheduler";

export = benchmark({
	functions: {
		onSnakeTick,
		onCandyTick,
		onCollisionTick,
		getSafePointInWorld,
	},
});

async function setup() {
	// Clear the store and grids
	store.destroy();
	store.resetState();
	candyGrid.clear();
	snakeGrid.clear();

	// Generate 50 snakes of varying lengths
	for (const index of $range(0, 50)) {
		const x = (index * 4) % WORLD_BOUNDS;
		const y = math.floor(index / 4) * 4;
		const position = new Vector2(x, y);

		store.addSnake(`Snake ${index}`, {
			head: position,
			score: 1000 + 160 * index,
			desiredAngle: 0.5 * index,
		});
	}

	// Generate the maximum number of candies
	store.populateCandy(fillArray(CANDY_LIMITS.default, () => createCandy()));

	// Schedulers may persist after the benchmark is complete, so we need to
	// disconnect them manually.
	task.defer(() => {
		store.destroy();
		disconnectAllSchedulers();
	});
}

setup();
