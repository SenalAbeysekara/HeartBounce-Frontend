import { useEffect, useMemo, useRef, useState } from "react";
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

// obstacles
const STONE_COUNT = 8;
const STONE_MIN_H = 160;
const STONE_MAX_H = 220;

// collectibles
const STAR_COUNT = 10;
const STAR_SIZE = 58;
const STAR_SCORE = 50;

// gameplay feel
const OBSTACLE_SPACING_MIN = 520;
const OBSTACLE_SPACING_MAX = 760;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

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
  const iw = img.width;
  const ih = img.height;

  const scale = Math.max(W / iw, H / ih);
  const sw = iw * scale;
  const sh = ih * scale;

  const offset = -(scrollX % sw);
  for (let x = offset; x < W + sw; x += sw) {
    ctx.drawImage(img, x, (H - sh) / 2, sw, sh);
  }
}

function randBetween(a, b) {
  return a + Math.random() * (b - a);
}

function getTheme(difficulty) {
  if (difficulty === "easy")
    return { bg: "/sprites/bg1.jpg", obstacle: "/sprites/obstacle1.png" };
  if (difficulty === "hard")
    return { bg: "/sprites/bg3.jpg", obstacle: "/sprites/obstacle3.png" };
  return { bg: "/sprites/bg2.jpg", obstacle: "/sprites/obstacle2.png" };
}

function makeObstacles(obstacleImg) {
  const arr = [];
  let x = 950;

  const ratio =
    obstacleImg && obstacleImg.height
      ? obstacleImg.width / obstacleImg.height
      : 1.4;

  for (let i = 0; i < STONE_COUNT; i++) {
    x += randBetween(OBSTACLE_SPACING_MIN, OBSTACLE_SPACING_MAX);

    const h = Math.floor(randBetween(STONE_MIN_H, STONE_MAX_H));
    const w = Math.floor(clamp(h * ratio * 1.25, 180, 320));

    arr.push({
      x,
      w,
      h,
      groundSink: 27,
    });
  }
  return arr;
}

function makeStars() {
  const stars = [];
  let x = 850;

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
  const speedMult = location.state?.speedMult ?? 1.0;

  const theme = useMemo(() => getTheme(difficulty), [difficulty]);
  const RUN_SPEED = useMemo(() => BASE_SPEED * speedMult, [speedMult]);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTRef = useRef(performance.now());
  const keysRef = useRef({ jump: false });

  // PLAY | HEART | GAME_OVER
  const [status, setStatus] = useState("PLAY");

  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  const [loaded, setLoaded] = useState(false);

  // 3 revives per run
  const [revivesLeft, setRevivesLeft] = useState(3);

  // Heart puzzle
  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState("");
  const [puzzleAttemptsLeft, setPuzzleAttemptsLeft] = useState(3);

  // sprites
  const spritesRef = useRef(null);

  // 1 second shield after revive
  const invincibleRef = useRef(0);

  // only save once
  const savedRef = useRef(false);

  // store which obstacle hit
  const hitObstacleIndexRef = useRef(null);

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

    const obstacleImg = spritesRef.current?.obstacle;
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
      obstacles: makeObstacles(obstacleImg),
      stars: makeStars(),
    };

    lastTRef.current = performance.now();
  }

  async function saveRun(finalScore) {
    if (savedRef.current) return;
    savedRef.current = true;

    try {
      await axios.post(
        import.meta.env.VITE_API_URL + "/api/game/runs",
        {
          score: Number(finalScore) || 0,
          difficulty,
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to save run:", err?.message || err);
    }
  }

  async function fetchHeart() {
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + "/api/game/heart/new",
        { withCredentials: true }
      );
      setPuzzle(res.data);
      setAnswer("");
      setPuzzleAttemptsLeft(3);
    } catch (err) {
      console.error("Heart API failed:", err?.message || err);
      await saveRun(scoreRef.current);
      setStatus("GAME_OVER");
    }
  }

  function endGame() {
    saveRun(scoreRef.current);
    setStatus("GAME_OVER");
  }

  function moveHitObstacleForward() {
    const w = worldRef.current;
    const idx = hitObstacleIndexRef.current;
    if (idx == null) return;

    const obs = w.obstacles;
    if (!obs[idx]) return;

    const farthestX = Math.max(...obs.map((o) => o.x));
    obs[idx].x = farthestX + randBetween(650, 950);

    hitObstacleIndexRef.current = null;
  }

  function handleHeartSubmit() {
    if (!puzzle) return;

    const userAns = Number(answer);
    const correct =
      !Number.isNaN(userAns) && userAns === Number(puzzle.solution);

    if (correct) {
      invincibleRef.current = 1.0;
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

  // Load images (theme based)
  useEffect(() => {
    let dead = false;
    setLoaded(false);

    (async () => {
      try {
        const [bg, ball, obstacle, star] = await Promise.all([
          loadImage(theme.bg),
          loadImage("/sprites/ball.png"),
          loadImage(theme.obstacle),
          loadImage("/sprites/star.png"),
        ]);
        if (dead) return;

        spritesRef.current = { bg, ball, obstacle, star };

        // build obstacles AFTER obstacle loads (ratio correct)
        worldRef.current.obstacles = makeObstacles(obstacle);

        setLoaded(true);
      } catch (e) {
        console.error("Image load error:", e);
      }
    })();

    return () => {
      dead = true;
    };
  }, [theme]);

  // Controls
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    function drawObstacleShadow(ctx2, sx, ww) {
      ctx2.save();
      ctx2.globalAlpha = 0.35;
      ctx2.beginPath();
      ctx2.ellipse(
        sx + ww * 0.5,
        GROUND_Y + 11,
        ww * 0.42,
        12,
        0,
        0,
        Math.PI * 2
      );
      ctx2.fillStyle = "black";
      ctx2.fill();
      ctx2.restore();
    }

    function draw() {
      const w = worldRef.current;
      const s = spritesRef.current;

      ctx.clearRect(0, 0, W, H);

      // background
      if (s?.bg) drawScrollingBg(ctx, s.bg, w.scrollX * 0.55);
      else {
        ctx.fillStyle = "#67cbe7";
        ctx.fillRect(0, 0, W, H);
      }

      // road
      ctx.fillStyle = "rgba(7,10,25,0.95)";
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

      // highlight
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(0, GROUND_Y, W, 4);

      // stars
      for (const st of w.stars) {
        if (st.taken) continue;
        const sx = st.x - w.scrollX;
        if (sx < -240 || sx > W + 240) continue;

        const bobY = Math.sin(w.time * 3 + st.bob) * 6;

        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(sx, st.y + bobY, st.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 220, 80, 1)";
        ctx.fill();
        ctx.restore();

        if (s?.star) {
          ctx.drawImage(
            s.star,
            sx - st.size / 2,
            st.y + bobY - st.size / 2,
            st.size,
            st.size
          );
        }
      }

      // obstacles
      for (const ob of w.obstacles) {
        const sx = ob.x - w.scrollX;
        if (sx < -520 || sx > W + 520) continue;

        const drawY = GROUND_Y - ob.h + ob.groundSink;

        drawObstacleShadow(ctx, sx, ob.w);

        if (s?.obstacle) ctx.drawImage(s.obstacle, sx, drawY, ob.w, ob.h);
        else {
          ctx.fillStyle = "#666";
          ctx.fillRect(sx, drawY, ob.w, ob.h);
        }
      }

      // player
      const p = w.player;
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot);
      ctx.translate(-(p.x + p.w / 2), -(p.y + p.h / 2));

      if (s?.ball) ctx.drawImage(s.ball, p.x, p.y, p.w, p.h);
      else {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(18, 18, 560, 52);
      ctx.fillStyle = "white";
      ctx.font = "18px system-ui";
      ctx.fillText(`Score: ${Math.floor(scoreRef.current)}`, 34, 50);
      ctx.fillText(`Mode: ${difficulty}`, 190, 50);
      ctx.fillText(`Revives: ${revivesLeft}`, 340, 50);

      if (invincibleRef.current > 0) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(18, 78, 150, 36);
        ctx.fillStyle = "white";
        ctx.font = "16px system-ui";
        ctx.fillText("Shield!", 45, 102);
      }

      if (status === "GAME_OVER") {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "white";
        ctx.font = "34px system-ui";
        ctx.fillText("Game Over", W / 2 - 95, H / 2 - 12);
        ctx.font = "18px system-ui";
        ctx.fillText("Press Enter to restart", W / 2 - 110, H / 2 + 22);
      }

      if (!loaded) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "white";
        ctx.font = "20px system-ui";
        ctx.fillText("Loading images…", W / 2 - 70, H / 2);
      }
    }

    function step(now) {
      const w = worldRef.current;
      const dt = Math.min(0.033, (now - lastTRef.current) / 1000);
      lastTRef.current = now;

      w.time += dt;
      invincibleRef.current = Math.max(0, invincibleRef.current - dt);

      if (status === "PLAY") {
        w.scrollX += RUN_SPEED * dt;

        const p = w.player;
        p.rot += dt * 10;

        // jump
        if (keysRef.current.jump && p.onGround) {
          p.vy = JUMP_V;
          p.onGround = false;
        }

        // gravity
        p.vy += GRAVITY * dt;
        p.y += p.vy * dt;

        // ground
        if (p.y + p.h >= GROUND_Y) {
          p.y = GROUND_Y - p.h;
          p.vy = 0;
          p.onGround = true;
        }

        // ball hitbox (world coords)
        const ballCx = p.x + w.scrollX + p.w / 2;
        const ballCy = p.y + p.h / 2;
        const ballR = (p.w / 2) * 0.74;

        // ✅ collision (NO air hits)
        if (invincibleRef.current <= 0) {
          for (let i = 0; i < w.obstacles.length; i++) {
            const ob = w.obstacles[i];
            const drawY = GROUND_Y - ob.h + ob.groundSink;

            // ✅ stronger inset (fix ghost hits)
            const padX = ob.w * 0.28;
            const padTop = ob.h * 0.32;
            const padBottom = ob.h * 0.10;

            const hbX = ob.x + padX;
            const hbY = drawY + padTop;
            const hbW = ob.w - padX * 2;
            const hbH = ob.h - padTop - padBottom;

            // ✅ if ball is clearly ABOVE hitbox, skip collision
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

        // stars => score
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

        // recycle obstacles (KEEP BIG SIZING)
        for (const ob of w.obstacles) {
          if (ob.x - w.scrollX < -620) {
            const farthestX = Math.max(...w.obstacles.map((x) => x.x));
            ob.x =
              farthestX +
              randBetween(OBSTACLE_SPACING_MIN, OBSTACLE_SPACING_MAX);

            ob.h = Math.floor(randBetween(STONE_MIN_H, STONE_MAX_H));

            const ratio = spritesRef.current?.obstacle
              ? spritesRef.current.obstacle.width /
              spritesRef.current.obstacle.height
              : 1.4;

            ob.w = Math.floor(clamp(ob.h * ratio * 1.25, 180, 320));
            ob.groundSink = 27;
          }
        }

        // recycle stars
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

      draw();
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, loaded, RUN_SPEED, difficulty, revivesLeft]);

  return (
    <AuthLayout>
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="text-white/70 text-sm">
            <b>Only The Fastest Survive</b>
          </div>
          <Link to="/mainmenu" className="text-sm text-white/60 hover:text-white">
            ← Back to Menu
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-3 md:p-4 backdrop-blur-2xl shadow-2xl">
          <canvas
            ref={canvasRef}
            className="block w-full border border-white/10 shadow-2xl"
            style={{
              height: "auto",
              borderRadius: 18,
              margin: "0 auto",
              maxWidth: "100%",
            }}
          />
        </div>

        {/* HEART POPUP */}
        {status === "HEART" && puzzle && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="w-full max-w-lg bg-[#0b1027] p-6 sm:p-8 rounded-2xl text-center border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-extrabold text-white">
                Revive Challenge
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Solve Correctly To Continue Bounce.
              </p>

              <img
                src={puzzle.question}
                alt="puzzle"
                className="mx-auto mt-5 mb-5 max-h-56 rounded-xl border border-white/10"
              />

              <div className="flex items-center justify-center gap-3">
                <input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-40 rounded-xl px-4 py-3 text-white"
                  placeholder="Answer"
                  inputMode="numeric"
                />
                <button
                  onClick={handleHeartSubmit}
                  className="rounded-xl bg-emerald-400 px-5 py-3 font-extrabold text-[#070a18] hover:brightness-110 transition"
                >
                  Submit
                </button>
              </div>

              <div className="mt-4 text-red-300 font-semibold">
                Puzzle attempts left: {puzzleAttemptsLeft}
              </div>

              <button
                onClick={endGame}
                className="mt-5 text-sm text-white/60 hover:text-white transition"
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