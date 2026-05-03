// client/services/cloudinary/upload/urlBuilders.js

import { BASE_URL } from "../upload/constants";

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildImageUrl(publicId, transforms) {
  return `${BASE_URL}/image/upload/${transforms}/${publicId}`;
}

function buildVideoUrl(publicId, transforms) {
  return `${BASE_URL}/video/upload/${transforms}/${publicId}`;
}

function buildAudioUrl(publicId, transforms) {
  // Cloudinary serves audio under /video/upload/
  return `${BASE_URL}/video/upload/${transforms}/${publicId}`;
}

export function getPosterUrl(publicIdOrUrl, opts = {}) {
  if (!publicIdOrUrl) {
    return {
      src: "/KritiQ/Placeholders/poster-placeholder.webp",
      blurDataURL: null,
    };
  }

  // Already a full URL (legacy or external) — can't transform, return as-is
  if (publicIdOrUrl.startsWith("http")) {
    return { src: publicIdOrUrl, blurDataURL: null };
  }

  const {
    width = 400,
    height = 600,
    format = "auto",
    crop = "fill",
    gravity = "auto",
  } = opts;

  // ── Full-res src ──────────────────────────────────────────────────────────
  // q_auto:best  → Cloudinary picks highest acceptable quality per device
  // f_auto       → AVIF for Chrome, WebP for Safari, JPEG fallback
  // dpr_auto     → 2x on retina, 1x on low-res — no wasted bytes
  // e_sharpen:60 → poster-specific sharpening (faces, text, edges pop)
  // fl_progressive → progressive JPEG for slow connections
  const srcTransforms = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `g_${gravity}`,
    `q_auto:best`,
    `f_${format}`,
    `dpr_auto`,
    `e_sharpen:60`,
    `fl_progressive`,
  ].join(",");

  // ── Blur placeholder ──────────────────────────────────────────────────────
  // 20×30px, quality 10, heavy blur — loads in ~200 bytes from CDN edge.
  // Next.js Image accepts this as blurDataURL and crossfades to src on load.
  // Do NOT use base64 here — the Cloudinary URL is already cached at the edge,
  // so it loads faster than an inline base64 string on repeat visits.
  const blurTransforms = [
    `w_20`,
    `h_30`,
    `c_${crop}`,
    `g_${gravity}`,
    `q_10`,
    `f_webp`,
    `e_blur:800`,
  ].join(",");

  return {
    src: buildImageUrl(publicIdOrUrl, srcTransforms),
    blurDataURL: buildImageUrl(publicIdOrUrl, blurTransforms),
  };
}


/**
 * getAvatarUrl
 * User profile picture — square, face-cropped
 * size: pixel dimension (same for width & height)
 */
export function getAvatarUrl(publicIdOrUrl, size = 80) {
  if (!publicIdOrUrl) return "/KritiQ/Placeholders/poster-placeholder.webp";
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const transforms = [
    `w_${size}`,
    `h_${size}`,
    "c_fill",
    "g_face",
    "q_auto",
    "f_auto",
    "dpr_auto",
  ].join(",");

  return buildImageUrl(publicIdOrUrl, transforms);
}

/**
 * getBannerUrl
 * Hero banners — 1920×400 default, 1280×300 on low bandwidth
 */
export function getBannerUrl(publicIdOrUrl, opts = {}) {
  if (!publicIdOrUrl) return  "/KritiQ/Placeholders/poster-placeholder.webp";
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const { width = 1920, height = 400, lowBandwidth = false } = opts;

  const transforms = [
    `w_${lowBandwidth ? 960 : width}`,
    `h_${lowBandwidth ? 200 : height}`,
    "c_fill",
    "g_auto",
    `q_${lowBandwidth ? 40 : "auto"}`,
    "f_auto",
    "dpr_auto",
  ].join(",");

  return buildImageUrl(publicIdOrUrl, transforms);
}

/**
 * getBackdropUrl
 * Background images — 1280×720 default
 */
export function getBackdropUrl(publicIdOrUrl, opts = {}) {
  if (!publicIdOrUrl) return "/KritiQ/Placeholders/poster-placeholder.webp";
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const { width = 1280, height = 720, lowBandwidth = false } = opts;

  const transforms = [
    `w_${lowBandwidth ? 640 : width}`,
    `h_${lowBandwidth ? 360 : height}`,
    "c_fill",
    "g_auto",
    `q_${lowBandwidth ? 35 : "auto"}`,
    "f_auto",
    "dpr_auto",
  ].join(",");

  return buildImageUrl(publicIdOrUrl, transforms);
}

/**
 * getScreenshotUrl
 * Scene / movie screenshots
 */
export function getScreenshotUrl(publicIdOrUrl, opts = {}) {
  if (!publicIdOrUrl) return "/KritiQ/Placeholders/poster-placeholder.webp";
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const { width = 800, height = 450, lowBandwidth = false } = opts;

  const transforms = [
    `w_${lowBandwidth ? 400 : width}`,
    `h_${lowBandwidth ? 225 : height}`,
    "c_fill",
    "g_auto",
    `q_${lowBandwidth ? 40 : "auto"}`,
    "f_auto",
  ].join(",");

  return buildImageUrl(publicIdOrUrl, transforms);
}

// ─── Videos ─────────────────────────────────────────────────────────────────

/**
 * getTrailerUrl
 * Movie / show trailer — converts to MP4, auto quality
 * lowBandwidth: drops to 480p and lower bitrate
 */
export function getTrailerUrl(publicIdOrUrl, opts = {}) {
  if (!publicIdOrUrl) return null;
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const { lowBandwidth = false } = opts;

  const transforms = lowBandwidth
    ? "w_854,h_480,c_limit,q_auto:low,f_mp4,vc_h264"
    : "w_1280,h_720,c_limit,q_auto,f_mp4,vc_h264";

  return buildVideoUrl(publicIdOrUrl, transforms);
}

/**
 * getClipUrl
 * Short video clips (<60 sec)
 */
export function getClipUrl(publicIdOrUrl, opts = {}) {
  if (!publicIdOrUrl) return null;
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const { lowBandwidth = false } = opts;

  const transforms = lowBandwidth
    ? "w_640,h_360,c_limit,q_auto:low,f_mp4"
    : "w_1280,h_720,c_limit,q_auto,f_mp4";

  return buildVideoUrl(publicIdOrUrl, transforms);
}

/**
 * getVideoPreviewUrl
 * Very short preview thumbnail (<15 sec), silent, low weight
 */
export function getVideoPreviewUrl(publicIdOrUrl) {
  if (!publicIdOrUrl) return null;
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  // 15-second clip, 480p, silent, low quality for fast load
  return buildVideoUrl(
    publicIdOrUrl,
    "w_640,h_360,c_limit,q_auto:low,f_mp4,so_0,eo_15,ac_none",
  );
}

/**
 * getVideoThumbnailUrl
 * Poster frame extracted from a video asset
 */
export function getVideoThumbnailUrl(publicIdOrUrl, opts = {}) {
  if (!publicIdOrUrl) return "/KritiQ/Placeholders/poster-placeholder.webp";
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const { width = 640, height = 360, second = 1 } = opts;

  const transforms = [
    `w_${width}`,
    `h_${height}`,
    "c_fill",
    "g_auto",
    "q_auto",
    "f_jpg",
    `so_${second}`,
  ].join(",");

  return buildVideoUrl(publicIdOrUrl, transforms);
}

// ─── Audio ───────────────────────────────────────────────────────────────────

/**
 * getSongUrl
 * Full song — converts to AAC for best compression/quality ratio
 */
export function getSongUrl(publicIdOrUrl) {
  if (!publicIdOrUrl) return null;
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  return buildAudioUrl(publicIdOrUrl, "q_auto,f_aac");
}

/**
 * getAudioPreviewUrl
 * 30-second preview clip
 */
export function getAudioPreviewUrl(publicIdOrUrl) {
  if (!publicIdOrUrl) return null;
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  return buildAudioUrl(publicIdOrUrl, "so_0,eo_30,q_auto:low,f_aac");
}

/**
 * getPodcastUrl
 * Podcast episode — full length, AAC
 */
export function getPodcastUrl(publicIdOrUrl) {
  if (!publicIdOrUrl) return null;
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  return buildAudioUrl(publicIdOrUrl, "q_auto,f_aac");
}

/**
 * getSoundtrackUrl
 * Background score — low quality for ambient use
 */
export function getSoundtrackUrl(publicIdOrUrl) {
  if (!publicIdOrUrl) return null;
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  return buildAudioUrl(publicIdOrUrl, "q_auto:low,f_aac");
}
