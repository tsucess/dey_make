const PASSWORD_RESET_STORAGE_KEY = "deymake.auth.pendingPasswordReset";

export function getPendingPasswordReset() {
  const rawValue = typeof window === "undefined" ? null : window.sessionStorage.getItem(PASSWORD_RESET_STORAGE_KEY);

  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    window.sessionStorage.removeItem(PASSWORD_RESET_STORAGE_KEY);
    return null;
  }
}

export function setPendingPasswordReset(value) {
  if (typeof window === "undefined") return;

  if (!value) {
    window.sessionStorage.removeItem(PASSWORD_RESET_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(PASSWORD_RESET_STORAGE_KEY, JSON.stringify(value));
}

export function clearPendingPasswordReset() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PASSWORD_RESET_STORAGE_KEY);
}