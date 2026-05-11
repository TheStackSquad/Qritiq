// src/utils/hooks/resolveRedirect.js

export const resolveRedirect = (customRedirect, role) => {
  // Only honour a redirect if it's a real destination — not the default root
  if (customRedirect && customRedirect !== "/") return customRedirect;

  if (["creator", "pro", "admin"].includes(role)) {
    return "/pro/dashboard";
  }

  return "/";
};
