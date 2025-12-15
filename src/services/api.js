import { ERRORS } from "../config/error.js";

// ========== Core Fetch Layer ==========
export const fetchWithRetry = async (url, options = {}, retries = 1) => {
  try {
    const response = await fetch(url, options);
    const { ok, status } = response;

    if (!ok) {
      if (status === 429 && retries > 0) {
        console.error(`Rate limit hit, retrying (${retries} attempts left)...`);
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return fetchWithRetry(url, options, retries - 1);
      }

      return {
        ok: false,
        error: status === 429 ? ERRORS.RATE_LIMIT : ERRORS.NETWORK_ERROR,
        status,
      };
    }

    const data = await response.json();
    return { ok: true, data, status };
  } catch {
    return { ok: false, error: ERRORS.DEFAULT };
  }
};
