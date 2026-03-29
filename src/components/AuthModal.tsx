import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, KeyRound, User as UserIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";

type Step = "phone" | "otp" | "username";

const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, sendOtp, verifyOtp, setUsername: setUsernameFn } = useApp();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const autoVerifyTriggeredRef = useRef(false);

  const handleClose = () => {
    setShowAuthModal(false);
    setStep("phone");
    setPhone("");
    setOtp("");
    setDevOtp("");
    setUsername("");
    setError("");
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) { setError("Enter a valid 10-digit number"); return; }
    setError("");
    setLoading(true);
    try {
      const result = await sendOtp(phone);
      setDevOtp(result?.otp || "");
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length < 6) { setError("Enter 6-digit OTP"); return; }
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp(phone, otp);
      if (result.shouldSetupProfile) {
        setStep("username");
      } else {
        handleClose();
      }
    } catch (e: any) {
      setError(e.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async () => {
    if (username) {
      await setUsernameFn(username);
    }
    handleClose();
  };

  useEffect(() => {
    if (step !== "otp") {
      autoVerifyTriggeredRef.current = false;
      return;
    }

    if (otp.length < 6) {
      autoVerifyTriggeredRef.current = false;
      return;
    }

    if (loading || autoVerifyTriggeredRef.current) return;

    autoVerifyTriggeredRef.current = true;
    void handleOtpSubmit();
  }, [otp, step, loading]);

  return (
    <AnimatePresence>
      {showAuthModal && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-elevated"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Welcome to famFood6</h2>
              <button onClick={handleClose} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            {step === "phone" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Mobile Number</label>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 bg-transparent py-3 text-sm outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePhoneSubmit}
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:shadow-glow-primary disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">OTP sent to +91 {phone}</p>
                {devOtp && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                    Dev OTP: {devOtp}
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-transparent py-3 text-sm outline-none"
                  />
                </div>
                <button
                  onClick={handleOtpSubmit}
                  disabled={loading || otp.length < 6}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:shadow-glow-primary disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}

            {step === "username" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Verified! Set up your profile (optional)</p>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-sm outline-none"
                  />
                </div>
                <button
                  onClick={handleUsernameSubmit}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:shadow-glow-primary"
                >
                  {username ? "Save & Continue" : "Skip"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
