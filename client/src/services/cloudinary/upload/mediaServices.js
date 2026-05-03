//client/services/cloudinary/upload/mediaServices.js

import { getCookieToken } from "./constants";

/**
 * Uploads a file via the KritiQ API
 */
export async function uploadMedia(file, folder = "kritiq/posters") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${getCookieToken()}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }

  return res.json(); // { public_id, secure_url, width, height }
}

/**
 * Deletes an asset via the KritiQ API
 */
export async function deleteMedia(publicId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getCookieToken()}`,
    },
    body: JSON.stringify({ public_id: publicId }),
  });

  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

/**
 * Replace existing asset
 */
export async function updateMedia(publicId, newFile, folder) {
  await deleteMedia(publicId);
  return uploadMedia(newFile, folder);
}
