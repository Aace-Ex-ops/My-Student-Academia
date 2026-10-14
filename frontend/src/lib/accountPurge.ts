import { apiFetch } from "./api";

export const STORAGE_KEYS = {
  PROFILE: "msa_custom_user_profile",
  REGISTRY: "msa_registered_accounts_registry",
  ENROLLMENTS: "msa_user_enrollments_registry",
  WAITLISTS: "msa_waitlists_registry",
};

/**
 * Brute force deletes user data from localStorage and backend databases.
 * @param targetEmail Optional specific email to delete. If omitted or wipeAll=true, purges all local accounts.
 * @param wipeAll If true, clears all user registries and stored profiles.
 */
export async function bruteForcePurgeAllUserData(targetEmail?: string, wipeAll = false): Promise<boolean> {
  try {
    const normalizedEmail = targetEmail?.trim().toLowerCase();

    // 1. Attempt backend cascade delete
    try {
      if (wipeAll) {
        await apiFetch("/api/auth/wipe-all-users", { method: "POST" }).catch(() => {});
      } else if (normalizedEmail) {
        await apiFetch("/api/auth/delete-account", {
          method: "POST",
          body: JSON.stringify({ email: normalizedEmail }),
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("Backend purge notice:", e);
    }

    // 2. LocalStorage Purge
    if (wipeAll || !normalizedEmail) {
      // Complete wipe of all MSA accounts and session data
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.REGISTRY);
      localStorage.removeItem(STORAGE_KEYS.ENROLLMENTS);
      localStorage.removeItem(STORAGE_KEYS.WAITLISTS);

      // Clean any other msa_ keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("msa_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } else {
      // Selective wipe for specific email
      const currentProfileRaw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (currentProfileRaw) {
        try {
          const profile = JSON.parse(currentProfileRaw);
          if (profile.email && profile.email.trim().toLowerCase() === normalizedEmail) {
            localStorage.removeItem(STORAGE_KEYS.PROFILE);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.PROFILE);
        }
      }

      // Purge from accounts registry
      const rawReg = localStorage.getItem(STORAGE_KEYS.REGISTRY);
      if (rawReg) {
        try {
          const reg = JSON.parse(rawReg);
          if (reg && typeof reg === "object" && !Array.isArray(reg)) {
            if (reg[normalizedEmail]) {
              delete reg[normalizedEmail];
              localStorage.setItem(STORAGE_KEYS.REGISTRY, JSON.stringify(reg));
            }
          } else {
            localStorage.removeItem(STORAGE_KEYS.REGISTRY);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.REGISTRY);
        }
      }

      // Purge enrollments for this email
      const rawEnr = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      if (rawEnr) {
        try {
          const enr = JSON.parse(rawEnr);
          if (enr && typeof enr === "object") {
            if (enr[normalizedEmail]) delete enr[normalizedEmail];
            localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enr));
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.ENROLLMENTS);
        }
      }
    }

    sessionStorage.clear();
    return true;
  } catch (err) {
    console.error("Purge Error:", err);
    return false;
  }
}
