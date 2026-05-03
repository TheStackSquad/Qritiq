// client/services/cloudinary/constants.js

export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`;

export function getCookieToken() {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/access_token=([^;]+)/)?.[1] || "";
}
