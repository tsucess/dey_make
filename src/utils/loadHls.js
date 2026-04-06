export async function loadHls() {
  const module = await import("hls.js/dist/hls.light.mjs");
  return module.default;
}