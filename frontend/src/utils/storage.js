// Safe localStorage wrapper: never throws (private mode, blocked storage, SSR).
const getStore = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

export const storage = {
  get(key, fallback = null) {
    try {
      return getStore()?.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      getStore()?.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      getStore()?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
