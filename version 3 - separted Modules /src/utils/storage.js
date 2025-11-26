export const Storage = (() => {
  const readJSON = (key, fallback) => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : fallback;
    } catch (e) {
      console.warn("Storage read failed", e);
      return fallback;
    }
  };

  const writeJSON = (key, storedValue) => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  };

  return {
    readJSON,
    writeJSON,
  };
})();
