// Imports React hooks used for state, references, and side effects.
import { useEffect, useRef, useState } from "react";

// Imports axios for backend API requests.
import axios from "axios";

// Imports the shared page layout.
import AuthLayout from "../AuthLayout";

// Imports routing tools.
import { Link, useLocation } from "react-router-dom";

// Imports fixed game values from the constants file.
import {
  W,
  H,
  GROUND_Y,
  GRAVITY,
  JUMP_V,
  BASE_SPEED,
  BALL_SIZE,
  STONE_MIN_H,
  STONE_MAX_H,
  STAR_SCORE,
  OBSTACLE_SPACING_MIN,
  OBSTACLE_SPACING_MAX,
} from "./gameConstants";

// Imports collision helpers.
import { clamp, circleRect } from "./collision";

// Imports drawing and image-loading helpers.
import { loadImage, drawScrollingBg, drawStars } from "./drawHelpers";

// Imports helper functions for random values and world creation.
import { randBetween, makeObstacles, makeStars } from "./gameHelpers";

// Main HeartBounce game page.
export default function HeartBounceGame() {
  // Gets the data passed from the previous route.
  const location = useLocation();

  // Reads selected difficulty and speed.
  // If nothing was passed, default values are used.
  const difficulty = location.state?.difficulty ?? "medium";
  const speedMult = location.state?.speedMult ?? 1;

  // Reads background and obstacle theme.
  // If nothing was passed, default images are used.
  const theme = location.state ?? {
    bg: "/sprites/bg2.jpg",
    obstacle: "/sprites/obstacle2.png",
  };

  // Calculates final running speed using the selected multiplier.
  const RUN_SPEED = BASE_SPEED * speedMult;

  // References used for canvas animation and keyboard state.
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTRef = useRef(performance.now());
  const keysRef = useRef({ jump: false });

  // Stores loaded images and game values that change often.
  // Refs are used so they can change without forcing re-render.
  const spritesRef = useRef(null);
  const scoreRef = useRef(0);
  const invincibleRef = useRef(0);
  const savedRef = useRef(false);
  const hitObstacleIndexRef = useRef(null);

  // Stores the current game state.
  const [status, setStatus] = useState("PLAY");

  // Stores the visible score.
  const [score, setScore] = useState(0);

  // Tells whether the image assets are ready.
  const [loaded, setLoaded] = useState(false);

  // Number of revives left in this run.
  const [revivesLeft, setRevivesLeft] = useState(3);

  // Revive challenge data.
  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState("");
  const [puzzleAttemptsLeft, setPuzzleAttemptsLeft] = useState(3);

  // Stores the whole game world.
  const worldRef = useRef({
    scrollX: 0,
    time: 0,
    player: {
      x: 200,
      y: GROUND_Y - BALL_SIZE,
      w: BALL_SIZE,
      h: BALL_SIZE,
      vy: 0,
      onGround: true,
      rot: 0,
    },
    obstacles: [],
    stars: makeStars(),
  });

  // Keeps the score ref synced with the latest score state.
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Resets the game back to its starting state.
  function resetGame() {
    setStatus("PLAY");
    setScore(0);
    scoreRef.current = 0;

    setRevivesLeft(3);
    setPuzzle(null);
    setAnswer("");
    setPuzzleAttemptsLeft(3);

    invincibleRef.current = 0;
    savedRef.current = false;
    hitObstacleIndexRef.current = null;

    worldRef.current = {
      scrollX: 0,
      time: 0,
      player: {
        x: 200,
        y: GROUND_Y - BALL_SIZE,
        w: BALL_SIZE,
        h: BALL_SIZE,
        vy: 0,
        onGround: true,
        rot: 0,
      },
      obstacles: makeObstacles(spritesRef.current?.obstacle),
      stars: makeStars(),
    };

    lastTRef.current = performance.now();
  }

  // Saves the finished run to the backend.
  // It only saves once per run.
  async function saveRun(finalScore) {
    if (savedRef.current) return;
    savedRef.current = true;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/game/runs`,
        { score: Number(finalScore) || 0, difficulty },
        { withCredentials: true }
      );
    } catch {}
  }

  // Requests a new revive puzzle from the backend.
  async function fetchHeart() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/game/heart/new`,
        { withCredentials: true }
      );

      setPuzzle(res.data);
      setAnswer("");
      setPuzzleAttemptsLeft(3);
    } catch {
      saveRun(scoreRef.current);
      setStatus("GAME_OVER");
    }
  }

  // Ends the game and saves the score.
  function endGame() {
    saveRun(scoreRef.current);
    setStatus("GAME_OVER");
  }

  // Moves the obstacle that caused the hit further away after a successful revive.
  function moveHitObstacleForward() {
    const idx = hitObstacleIndexRef.current;
    const obs = worldRef.current.obstacles;

    if (idx == null || !obs[idx]) return;

    const farthestX = Math.max(...obs.map((o) => o.x));
    obs[idx].x = farthestX + randBetween(650, 950);
    hitObstacleIndexRef.current = null;
  }

  // Checks the answer given in the revive popup.
  function handleHeartSubmit() {
    if (!puzzle) return;

    if (Number(answer) === Number(puzzle.solution)) {
      invincibleRef.current = 1;
      moveHitObstacleForward();
      setStatus("PLAY");
      setPuzzle(null);
      setAnswer("");
      setPuzzleAttemptsLeft(3);
      return;
    }

    const left = puzzleAttemptsLeft - 1;
    setPuzzleAttemptsLeft(left);

    if (left <= 0) endGame();
  }

  // Loads background, player, obstacle, and star images.
  useEffect(() => {
    let dead = false;
    setLoaded(false);

    (async () => {
      const [bg, ball, obstacle, star] = await Promise.all([
        loadImage(theme.bg),
        loadImage("/sprites/ball.png"),
        loadImage(theme.obstacle),
        loadImage("/sprites/star.png"),
      ]);

      if (dead) return;

      spritesRef.current = { bg, ball, obstacle, star };
      worldRef.current.obstacles = makeObstacles(obstacle);
      setLoaded(true);
    })();

    return () => {
      dead = true;
    };
  }, [theme.bg, theme.obstacle]);

  // Handles jump and restart keyboard controls.
  useEffect(() => {
    const down = (e) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        keysRef.current.jump = true;
        e.preventDefault();
      }

      if (status === "GAME_OVER" && e.key === "Enter") {
        resetGame();
      }
    };

    const up = (e) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        keysRef.current.jump = false;
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up, { passive: false });

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [status]);

  // Main game loop.
  // This controls movement, collision, score updates, and drawing.
  useEffect(() => {
    if (!loaded || !spritesRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = W;
    canvas.height = H;

    const step = (now) => {
      const w = worldRef.current;
      const dt = Math.min(0.033, (now - lastTRef.current) / 1000);
      lastTRef.current = now;

      w.time += dt;
      invincibleRef.current = Math.max(0, invincibleRef.current - dt);

      if (status === "PLAY") {
        w.scrollX += RUN_SPEED * dt;

        const p = w.player;
        p.rot += dt * 10;

        // Makes the player jump only when on the ground.
        if (keysRef.current.jump && p.onGround) {
          p.vy = JUMP_V;
          p.onGround = false;
        }

        // Applies gravity and vertical movement.
        p.vy += GRAVITY * dt;
        p.y += p.vy * dt;

        // Stops the player on the ground.
        if (p.y + p.h >= GROUND_Y) {
          p.y = GROUND_Y - p.h;
          p.vy = 0;
          p.onGround = true;
        }

        // Calculates player circle hitbox in world coordinates.
        const ballCx = p.x + w.scrollX + p.w / 2;
        const ballCy = p.y + p.h / 2;
        const ballR = (p.w / 2) * 0.74;

        const s = spritesRef.current;

        // Checks collision with obstacles when shield is not active.
        if (invincibleRef.current <= 0) {
          for (let i = 0; i < w.obstacles.length; i++) {
            const ob = w.obstacles[i];
            const drawY = GROUND_Y - ob.h + ob.groundSink;

            const padX = ob.w * 0.28;
            const padTop = ob.h * 0.32;
            const padBottom = ob.h * 0.1;

            const hbX = ob.x + padX;
            const hbY = drawY + padTop;
            const hbW = ob.w - padX * 2;
            const hbH = ob.h - padTop - padBottom;

            // Skips collision if the player is clearly above the obstacle hitbox.
            if (ballCy + ballR < hbY + 8) continue;

            if (circleRect(ballCx, ballCy, ballR, hbX, hbY, hbW, hbH)) {
              if (revivesLeft <= 0) {
                endGame();
                break;
              }

              hitObstacleIndexRef.current = i;
              setRevivesLeft((r) => Math.max(0, r - 1));
              setStatus("HEART");
              fetchHeart();
              break;
            }
          }
        }

        // Checks collision with stars and adds score.
        for (const st of w.stars) {
          if (st.taken) continue;

          const dx = ballCx - st.x;
          const dy = ballCy - st.y;
          const rr = ballR + st.size * 0.45;

          if (dx * dx + dy * dy <= rr * rr) {
            st.taken = true;

            setScore((current) => {
              const nextScore = current + STAR_SCORE;
              scoreRef.current = nextScore;
              return nextScore;
            });
          }
        }

        // Recycles obstacles that go out of view.
        for (const ob of w.obstacles) {
          if (ob.x - w.scrollX < -620) {
            const farthestX = Math.max(...w.obstacles.map((item) => item.x));
            const ratio = s.obstacle.width / s.obstacle.height;

            ob.x = farthestX + randBetween(OBSTACLE_SPACING_MIN, OBSTACLE_SPACING_MAX);
            ob.h = Math.floor(randBetween(STONE_MIN_H, STONE_MAX_H));
            ob.w = Math.floor(clamp(ob.h * ratio * 1.25, 180, 320));
            ob.groundSink = 27;
          }
        }

        // Recycles stars that were taken or moved out of view.
        for (const st of w.stars) {
          if (st.taken || st.x - w.scrollX < -420) {
            const farthest = Math.max(...w.stars.map((item) => item.x));

            st.x = farthest + 420 + Math.random() * 420;
            st.y = randBetween(130, 330);
            st.taken = false;
            st.bob = Math.random() * Math.PI * 2;
          }
        }
      }

      // Clears the canvas before drawing the next frame.
      ctx.clearRect(0, 0, W, H);

      const s = spritesRef.current;

      // Draws the scrolling background.
      drawScrollingBg(ctx, s.bg, w.scrollX * 0.55);

      // Draws the stars and their glow effect.
      drawStars(ctx, w.stars, w.scrollX, w.time, s.star);

      // Draws all obstacles.
      for (const ob of w.obstacles) {
        const sx = ob.x - w.scrollX;
        const drawY = GROUND_Y - ob.h + ob.groundSink;
        ctx.drawImage(s.obstacle, sx, drawY, ob.w, ob.h);
      }

      // Draws the rotating player.
      const p = w.player;

      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot);
      ctx.drawImage(s.ball, -p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      // Draws the score and revive information.
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(18, 18, 360, 52);

      ctx.fillStyle = "white";
      ctx.font = "18px system-ui";
      ctx.fillText(`Score: ${Math.floor(scoreRef.current)}`, 34, 50);
      ctx.fillText(`Revives: ${revivesLeft}`, 190, 50);

      // Draws the game over overlay.
      if (status === "GAME_OVER") {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = "white";
        ctx.font = "34px system-ui";
        ctx.fillText("Game Over", W / 2 - 95, H / 2 - 12);

        ctx.font = "18px system-ui";
        ctx.fillText("Press Enter to restart", W / 2 - 110, H / 2 + 22);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, loaded, RUN_SPEED, difficulty, revivesLeft]);

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Top bar above the game canvas */}
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="text-white/70 text-sm">
            <b>Only The Fastest Survive</b>
          </div>

          <Link
            to="/mainmenu"
            className="text-sm text-white/60 hover:text-white"
          >
            ← Back to Menu
          </Link>
        </div>

        {/* Main canvas where the game is drawn */}
        <canvas
          ref={canvasRef}
          className="block w-full border border-white/10 shadow-2xl"
          style={{ height: "auto", borderRadius: 18 }}
        />

        {/* Revive popup shown after hitting an obstacle */}
        {status === "HEART" && puzzle && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70">
            <div className="bg-[#0b1027] p-6 rounded-2xl text-center">
              <h2 className="text-white text-xl font-bold">
                Revive Challenge
              </h2>

              <img src={puzzle.question} className="mx-auto mt-4" />

              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="mt-4 px-4 py-2 rounded"
              />

              <button
                onClick={handleHeartSubmit}
                className="ml-3 bg-emerald-400 px-4 py-2 rounded"
              >
                Submit
              </button>

              <div className="mt-3 text-red-300">
                Attempts left: {puzzleAttemptsLeft}
              </div>

              <button
                onClick={endGame}
                className="mt-5 text-sm text-white/60 hover:text-white"
              >
                Give up
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}