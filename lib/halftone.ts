/** 1 where a pixel is backdrop: near-black and connected to an image edge through near-black pixels. */
export function findBackdrop(lum: Float32Array, width: number, height: number, threshold = 0.1): Uint8Array {
  const back = new Uint8Array(width * height);
  const stack: number[] = [];
  for (let x = 0; x < width; x++) stack.push(x, x + (height - 1) * width);
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);
  while (stack.length) {
    const p = stack.pop() as number;
    if (back[p] || lum[p] > threshold) continue;
    back[p] = 1;
    const x = p % width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < width * (height - 1)) stack.push(p + width);
  }
  return back;
}

/** 0..1 dot strength. Dark page: from brightness. Light page: from darkness, 0 on backdrop. */
export function dotValue(lum: number, isBackdrop: boolean, dark: boolean): number {
  const v = dark ? (lum - 0.07) * 1.3 : isBackdrop ? 0 : (1 - lum - 0.1) * 1.25;
  return Math.min(1, Math.max(0, v));
}
