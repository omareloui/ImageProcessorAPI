export function loadImage(src) {
  return new Promise((res, _rej) => {
    const img = new Image();
    img.src = src;
    img.onload = res;
  });
}
