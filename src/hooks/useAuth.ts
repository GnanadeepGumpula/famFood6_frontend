import { useState, useEffect, useCallback } from "react";
import { apiFetch, setToken, clearToken, getToken, parseJwt } from "@/lib/api";

export interface AppUser {
  id: string;
  phone: string;
  username?: string;
  isAdmin: boolean;
}

export interface SendOtpResult {
  otp?: string;
}

export interface VerifyOtpResult {
  shouldSetupProfile: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  /** Hydrate username from profile endpoint after token is stored. */
  const loadProfile = useCallback(async () => {
    try {
      const data = await apiFetch('/api/users/profile');
      setUser(prev =>
        prev ? { ...prev, username: data.profileDetails?.name || undefined } : null
      );
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    const payload = parseJwt(token);
    if (!payload) { clearToken(); setLoading(false); return; }

    // Set user from token immediately so UI doesn't flash "logged out"
    setUser({ id: payload.userId, phone: payload.mobileNumber, isAdmin: payload.role === 'admin' });

    // Load username from profile
    loadProfile().finally(() => setLoading(false));
  }, [loadProfile]);

  const sendOtp = async (phone: string): Promise<SendOtpResult> => {
    return await apiFetch<SendOtpResult>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber: phone }),
    });
  };

  const verifyOtp = async (phone: string, otp: string): Promise<VerifyOtpResult> => {
    const data = await apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber: phone, otp }),
    });
    setToken(data.token);
    const payload = parseJwt(data.token);
    const userPhone = data.user.mobileNumber;
    const profileName = data.user.profileDetails?.name?.trim();
    const hasUsername = Boolean(profileName);
    const setupPromptKey = `profile_setup_prompted_${userPhone}`;
    const alreadyPrompted = localStorage.getItem(setupPromptKey) === '1';
    const shouldSetupProfile = !hasUsername && !alreadyPrompted;

    if (shouldSetupProfile) {
      localStorage.setItem(setupPromptKey, '1');
    }

    setUser({
      id: data.user.userId,
      phone: userPhone,
      username: hasUsername ? profileName : undefined,
      isAdmin: payload?.role === 'admin',
    });

    return { shouldSetupProfile };
  };

  const setUsername = async (name: string) => {
    await apiFetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ profileDetails: { name } }),
    });
    if (user?.phone) {
      localStorage.setItem(`profile_setup_prompted_${user.phone}`, '1');
    }
    setUser(prev => (prev ? { ...prev, username: name } : null));
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return { user, loading, sendOtp, verifyOtp, setUsername, logout };
};
