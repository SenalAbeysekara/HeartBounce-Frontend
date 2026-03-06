import {
  STONE_COUNT,
  STONE_MIN_H,
  STONE_MAX_H,
  STAR_COUNT,
  STAR_SIZE,
  OBSTACLE_SPACING_MIN,
  OBSTACLE_SPACING_MAX,
} from "./gameConstants";
import { clamp } from "./collision";

// Returns a random number between two values.
export const randBetween = (a, b) => a + Math.random() * (b - a);

// Creates one obstacle with random size.
export function createObstacle(x, img) {
  const ratio = img?.height ? img.width / img.height : 1.4;
  const h = Math.floor(randBetween(STONE_MIN_H, STONE_MAX_H));
  const w = Math.floor(clamp(h * ratio * 1.25, 180, 320));
  return { x, w, h, groundSink: 27 };
}

// Creates the full starting obstacle list.
export function makeObstacles(img) {
  let x = 950;
  const arr = [];

  for (let i = 0; i < STONE_COUNT; i++) {
    x += randBetween(OBSTACLE_SPACING_MIN, OBSTACLE_SPACING_MAX);
    arr.push(createObstacle(x, img));
  }

  return arr;
}

// Creates the full starting star list.
export function makeStars() {
  let x = 850;
  const stars = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    x += 320 + Math.random() * 320;

    stars.push({
      x,
      y: randBetween(130, 330),
      size: STAR_SIZE,
      taken: false,
      bob: Math.random() * Math.PI * 2,
    });
  }

  return stars;
}