import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AuthLayout from "./AuthLayout";
import { Link, useLocation } from "react-router-dom";

const W = 1350;
const H = 468;

const GROUND_Y = 460;
const GRAVITY = 2100;
const JUMP_V = -1060;

const BASE_SPEED = 420;
const BALL_SIZE = 42;

const STONE_COUNT = 8;
const STONE_MIN_H = 160;
const STONE_MAX_H = 220;

const STAR_COUNT = 10;
const STAR_SIZE = 58;
const STAR_SCORE = 50;

const OBSTACLE_SPACING_MIN = 520;
const OBSTACLE_SPACING_MAX = 760;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const randBetween = (a, b) => a + Math.random() * (b - a);

function circleRect(cx, cy, r, rx, ry, rw, rh) {
  const px = clamp(cx, rx, rx + rw);
  const py = clamp(cy, ry, ry + rh);
  const dx = cx - px;
  const dy = cy - py;
  return dx * dx + dy * dy <= r * r;
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.src = src;
    img.onload = () => res(img);
    img.onerror = rej;
  });
}

function drawScrollingBg(ctx, img, scrollX) {
  const scale = Math.max(W / img.width, H / img.height);
  const sw = img.width * scale;
  const sh = img.height * scale;
  const offset = -(scrollX % sw);

  for (let x = offset; x < W + sw; x += sw) {
    ctx.drawImage(img, x, (H - sh) / 2, sw, sh);
  }
}

function createObstacle(x, img) {
  const ratio = img?.height ? img.width / img.height : 1.4;
  const h = Math.floor(randBetween(STONE_MIN_H, STONE_MAX_H));
  const w = Math.floor(clamp(h * ratio * 1.25, 180, 320));
  return { x, w, h, groundSink: 27 };
}

function makeObstacles(img) {
  let x = 950;
  const arr = [];

  for (let i = 0; i < STONE_COUNT; i++) {
    x += randBetween(OBSTACLE_SPACING_MIN, OBSTACLE_SPACING_MAX);
    arr.push(createObstacle(x, img));
  }

  return arr;
}

function makeStars() {
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

export default function BasketMazeCanvasGame() {
  const location = useLocation();

  const difficulty = location.state?.difficulty ?? "medium";
  const speedMult = location.state?.speedMult ?? 1;
  const theme = location.state ?? {
    bg: "/sprites/bg2.jpg",
    obstacle: "/sprites/obstacle2.png",
  };
  const RUN_SPEED = BASE_SPEED * speedMult;

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTRef = useRef(performance.now());
  const keysRef = useRef({ jump: false });

  const spritesRef = useRef(null);
  const scoreRef = useRef(0);
  const invincibleRef = useRef(0);
  const savedRef = useRef(false);
  const hitObstacleIndexRef = useRef(null);

  const [status, setStatus] = useState("PLAY");
  const [score, setScore] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [revivesLeft, setRevivesLeft] = useState(3);

  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState("");
  const [puzzleAttemptsLeft, setPuzzleAttemptsLeft] = useState(3);

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

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

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

  function endGame() {
    saveRun(scoreRef.current);
    setStatus("GAME_OVER");
  }

  function moveHitObstacleForward() {
    const idx = hitObstacleIndexRef.current;
    const obs = worldRef.current.obstacles;

    if (idx == null || !obs[idx]) return;

    const farthestX = Math.max(...obs.map((o) => o.x));
    obs[idx].x = farthestX + randBetween(650, 950);
    hitObstacleIndexRef.current = null;
  }

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

    return () => (dead = true);
  }, [theme.bg, theme.obstacle]);

  useEffect(() => {
    const down = (e) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        keysRef.current.jump = true;
        e.preventDefault();
      }

      if (status === "GAME_OVER" && e.key === "Enter") resetGame();
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

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

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

        if (keysRef.current.jump && p.onGround) {
          p.vy = JUMP_V;
          p.onGround = false;
        }

        p.vy += GRAVITY * dt;
        p.y += p.vy * dt;

        if (p.y + p.h >= GROUND_Y) {
          p.y = GROUND_Y - p.h;
          p.vy = 0;
          p.onGround = true;
        }

        const ballCx = p.x + w.scrollX + p.w / 2;
        const ballCy = p.y + p.h / 2;
        const ballR = (p.w / 2) * 0.74;

        const s = spritesRef.current;

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

        for (const st of w.stars) {
          if (st.taken) continue;

          const dx = ballCx - st.x;
          const dy = ballCy - st.y;
          const rr = ballR + st.size * 0.45;

          if (dx * dx + dy * dy <= rr * rr) {
            st.taken = true;

            setScore((s) => {
              const ns = s + STAR_SCORE;
              scoreRef.current = ns;
              return ns;
            });
          }
        }

        for (const ob of w.obstacles) {
          if (ob.x - w.scrollX < -620) {
            const farthestX = Math.max(...w.obstacles.map((x) => x.x));
            const ratio = s.obstacle.width / s.obstacle.height;

            ob.x =
              farthestX +
              randBetween(OBSTACLE_SPACING_MIN, OBSTACLE_SPACING_MAX);

            ob.h = Math.floor(randBetween(STONE_MIN_H, STONE_MAX_H));
            ob.w = Math.floor(clamp(ob.h * ratio * 1.25, 180, 320));
            ob.groundSink = 27;
          }
        }

        for (const st of w.stars) {
          if (st.taken || st.x - w.scrollX < -420) {
            const farthest = Math.max(...w.stars.map((x) => x.x));

            st.x = farthest + 420 + Math.random() * 420;
            st.y = randBetween(130, 330);
            st.taken = false;
            st.bob = Math.random() * Math.PI * 2;
          }
        }
      }

      ctx.clearRect(0, 0, W, H);

      const s = spritesRef.current;

      drawScrollingBg(ctx, s.bg, w.scrollX * 0.55);

      for (const st of w.stars) {
        if (st.taken) continue;

        const sx = st.x - w.scrollX;
        const bobY = Math.sin(w.time * 3 + st.bob) * 6;

        ctx.drawImage(
          s.star,
          sx - st.size / 2,
          st.y + bobY - st.size / 2,
          st.size,
          st.size
        );
      }

      for (const ob of w.obstacles) {
        const sx = ob.x - w.scrollX;
        const drawY = GROUND_Y - ob.h + ob.groundSink;
        ctx.drawImage(s.obstacle, sx, drawY, ob.w, ob.h);
      }

      const p = w.player;

      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot);
      ctx.drawImage(s.ball, -p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(18, 18, 360, 52);

      ctx.fillStyle = "white";
      ctx.font = "18px system-ui";
      ctx.fillText(`Score: ${Math.floor(scoreRef.current)}`, 34, 50);
      ctx.fillText(`Revives: ${revivesLeft}`, 190, 50);

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
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, loaded, RUN_SPEED, difficulty, revivesLeft]);

  return (
    <AuthLayout>
      <div className="w-full">
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

        <canvas
          ref={canvasRef}
          className="block w-full border border-white/10 shadow-2xl"
          style={{ height: "auto", borderRadius: 18 }}
        />

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