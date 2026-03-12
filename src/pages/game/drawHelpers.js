import { W, H } from "./gameConstants";

export function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.src = src;
    img.onload = () => res(img);
    img.onerror = rej;
  });
}

export function drawScrollingBg(ctx, img, scrollX) {
  const scale = Math.max(W / img.width, H / img.height);
  const sw = img.width * scale;
  const sh = img.height * scale;
  const offset = -(scrollX % sw);

  for (let x = offset; x < W + sw; x += sw) {
    ctx.drawImage(img, x, (H - sh) / 2, sw, sh);
  }
}

export function drawStars(ctx, stars, scrollX, time, starImage) {
  for (const st of stars) {
    if (st.taken) continue;

    const sx = st.x - scrollX;
    const bobY = Math.sin(time * 3 + st.bob) * 6;
    const sy = st.y + bobY;

    if (sx < -240 || sx > W + 240) continue;

    if (starImage) {
      ctx.drawImage(
        starImage,
        sx - st.size / 2,
        sy - st.size / 2,
        st.size,
        st.size
      );
    }
  }
}