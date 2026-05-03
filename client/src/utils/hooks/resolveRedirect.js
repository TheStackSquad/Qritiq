//client/src/utils/hooks/resolveRedirect.js

export const resolveRedirect = (customRedirect, role) => {
  if (customRedirect) return customRedirect;
  if (["creator", "pro", "admin"].includes(role)) {
    return "/pro/dashboard";
  }
  return "/";
};