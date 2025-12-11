import { ERRORS } from "../config/error.js";

// ========== Core Fetch Layer ==========
export const fetchWithRetry = async (url, options = {}, retries = 1) => {
  try {
    const response = await fetch(url, options);
    const { ok, status } = response;

    if (!ok) {
      if (status === 429 && retries > 0) {
        console.warn(`Rate limit hit, retrying (${retries} attempts left)...`);
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return fetchWithRetry(url, options, retries - 1);
      }

      if (status === 429) {
        return {
          ok: false,
          code: "RATE_LIMIT",
          error: ERRORS.RATE_LIMIT,
          status,
        };
      }

      return {
        ok: false,
        code: "HTTP_ERROR",
        error: ERRORS.HTTP_STATUS(status),
        status,
      };
    }

    const data = await response.json();
    return { ok: true, data, status };
  } catch {
    return { ok: false, code: "NETWORK_ERROR", error: ERRORS.DEFAULT };
  }
};
