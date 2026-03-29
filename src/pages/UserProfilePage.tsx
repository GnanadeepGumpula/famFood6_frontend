import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Heart,
  KeyRound,
  Package,
  PencilLine,
  Phone,
  PhoneCall,
  Shield,
  ShoppingCart,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import OrderTracker from "@/components/OrderTracker";

const LOYALTY_TARGET = 5;

const UserProfilePage = () => {
  const {
    user,
    orders,
    loyaltyMap,
    menuItems,
    favorites,
    cartCount,
    setShowAuthModal,
    setUsername,
    setCallNumber,
    changePassword,
    requestPhoneChangeOtp,
    verifyPhoneChangeOtp,
  } = useApp();

  const navigate = useNavigate();
  const [nameDraft, setNameDraft] = useState("");
  const [callNumberDraft, setCallNumberDraft] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPhoneDraft, setNewPhoneDraft] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [devPhoneOtp, setDevPhoneOtp] = useState("");
  const [phoneOtpRequested, setPhoneOtpRequested] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingCallNumber, setSavingCallNumber] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [updatingPhone, setUpdatingPhone] = useState(false);

  useEffect(() => {
    setNameDraft(user?.username || "");
    setCallNumberDraft((user?.callNumber || user?.phone || "").replace(/\D/g, "").slice(-10));
  }, [user?.username]);

  const activeOrders = useMemo(
    () => orders.filter((o) => !["delivered", "rejected", "cancelled"].includes(o.status)),
    [orders]
  );

  const loyaltyRows = useMemo(() => {
    return menuItems
      .map((item) => ({
        id: item.id,
        name: item.name,
        count: loyaltyMap[item.name] || 0,
      }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [menuItems, loyaltyMap]);

  const freeEligibleRows = loyaltyRows.filter((row) => row.count >= LOYALTY_TARGET);

  const handleSaveName = async () => {
    if (!nameDraft.trim()) return;
    setActionError("");
    setActionMessage("");
    setSavingName(true);
    try {
      await setUsername(nameDraft.trim());
      setActionMessage("Name updated successfully.");
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveCallNumber = async () => {
    if (!/^\d{10}$/.test(callNumberDraft)) {
      setActionError("Call number must be exactly 10 digits.");
      setActionMessage("");
      return;
    }

    setActionError("");
    setActionMessage("");
    setSavingCallNumber(true);
    try {
      await setCallNumber(callNumberDraft);
      setActionMessage("Call number updated successfully.");
    } catch (e: any) {
      setActionError(e.message || "Failed to update call number.");
    } finally {
      setSavingCallNumber(false);
    }
  };

  const handleChangePassword = async () => {
    if (currentPassword.length < 6 || newPassword.length < 6) {
      setActionError("Both current and new password must be at least 6 characters.");
      setActionMessage("");
      return;
    }

    setActionError("");
    setActionMessage("");
    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setActionMessage("Password changed successfully.");
    } catch (e: any) {
      setActionError(e.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRequestPhoneOtp = async () => {
    if (!/^\d{10}$/.test(newPhoneDraft)) {
      setActionError("New phone number must be exactly 10 digits.");
      setActionMessage("");
      return;
    }

    setActionError("");
    setActionMessage("");
    setUpdatingPhone(true);
    try {
      const result = await requestPhoneChangeOtp(newPhoneDraft);
      setDevPhoneOtp(result?.otp || "");
      setPhoneOtpRequested(true);
      setActionMessage("OTP sent to your new number.");
    } catch (e: any) {
      setActionError(e.message || "Failed to request OTP for phone update.");
    } finally {
      setUpdatingPhone(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) {
      setActionError("Enter 6-digit OTP.");
      setActionMessage("");
      return;
    }

    setActionError("");
    setActionMessage("");
    setUpdatingPhone(true);
    try {
      await verifyPhoneChangeOtp(newPhoneDraft, phoneOtp);
      setPhoneOtpRequested(false);
      setPhoneOtp("");
      setDevPhoneOtp("");
      setActionMessage("Phone number updated successfully.");
    } catch (e: any) {
      setActionError(e.message || "Failed to verify phone update OTP.");
    } finally {
      setUpdatingPhone(false);
    }
  };

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <UserIcon className="h-14 w-14 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold">Login to open profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile has order tracking, favorites, and loyalty rewards.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowAuthModal(true)}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-primary-foreground"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg border px-6 py-2 text-sm font-bold text-foreground"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container max-w-3xl py-6">
      <button
        onClick={() => navigate("/")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </button>

      <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
        <h1 className="font-display text-2xl font-black">My Profile</h1>
        <p className="mt-1 text-sm text-primary-foreground/80">{user.phone}</p>
        <p className="text-xs text-primary-foreground/80">Login ID: phone number</p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <PencilLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/70" />
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Set your name"
              className="w-full rounded-lg border border-primary-foreground/40 bg-primary-foreground/10 py-2 pl-10 pr-3 text-sm text-primary-foreground placeholder:text-primary-foreground/70 outline-none focus:border-primary-foreground"
            />
          </div>
          <button
            onClick={handleSaveName}
            disabled={!nameDraft.trim() || savingName}
            className="rounded-lg bg-primary-foreground px-4 py-2 text-sm font-bold text-primary disabled:opacity-60"
          >
            {savingName ? "Saving..." : "Save"}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4 shadow-card">
        <h2 className="font-display text-lg font-bold">Account Settings</h2>
        <p className="text-xs text-muted-foreground">Manage call number, password, and phone-number updates with OTP verification.</p>

        {actionMessage && (
          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
            {actionMessage}
          </div>
        )}
        {actionError && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
            {actionError}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-3">
            <div className="mb-2 flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold">Call Number</h3>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">Admins will use this number to call you for order confirmation and pickup updates.</p>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <input
                maxLength={10}
                value={callNumberDraft}
                onChange={(e) => setCallNumberDraft(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit call number"
                className="flex-1 bg-transparent py-2 text-sm outline-none"
              />
            </div>
            <button
              onClick={handleSaveCallNumber}
              disabled={savingCallNumber}
              className="mt-3 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
            >
              {savingCallNumber ? "Saving..." : "Save Call Number"}
            </button>
          </div>

          <div className="rounded-xl border p-3">
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold">Change Password</h3>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">After first OTP login, use password for future logins.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="flex-1 bg-transparent py-2 text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="flex-1 bg-transparent py-2 text-sm outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="mt-3 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>

          <div className="rounded-xl border p-3 lg:col-span-2">
            <div className="mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold">Change Login Phone Number</h3>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">We verify the new number with OTP before updating your login ID.</p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <input
                  maxLength={10}
                  value={newPhoneDraft}
                  onChange={(e) => setNewPhoneDraft(e.target.value.replace(/\D/g, ""))}
                  placeholder="New 10-digit phone"
                  className="flex-1 bg-transparent py-2 text-sm outline-none"
                />
              </div>
              <button
                onClick={handleRequestPhoneOtp}
                disabled={updatingPhone}
                className="rounded-lg border border-primary bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
              >
                {updatingPhone ? "Sending..." : "Send OTP"}
              </button>
            </div>

            {phoneOtpRequested && (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  maxLength={6}
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
                  className="rounded-lg border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={handleVerifyPhoneOtp}
                  disabled={updatingPhone || phoneOtp.length !== 6}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:shadow-glow-primary disabled:opacity-50"
                >
                  {updatingPhone ? "Verifying..." : "Verify OTP & Update"}
                </button>
              </div>
            )}

            {devPhoneOtp && (
              <p className="mt-2 text-xs text-amber-700">Dev OTP: {devPhoneOtp}</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button onClick={() => navigate("/orders")} className="rounded-xl border bg-card p-3 text-left shadow-card">
          <Package className="h-4 w-4 text-primary" />
          <p className="mt-2 text-xs text-muted-foreground">Track Orders</p>
          <p className="font-display text-lg font-black">{orders.length}</p>
        </button>
        <button onClick={() => navigate("/favorites")} className="rounded-xl border bg-card p-3 text-left shadow-card">
          <Heart className="h-4 w-4 text-secondary" />
          <p className="mt-2 text-xs text-muted-foreground">Favorites</p>
          <p className="font-display text-lg font-black">{favorites.length}</p>
        </button>
        <button onClick={() => navigate("/cart")} className="rounded-xl border bg-card p-3 text-left shadow-card">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <p className="mt-2 text-xs text-muted-foreground">Cart Items</p>
          <p className="font-display text-lg font-black">{cartCount}</p>
        </button>
        <button onClick={() => navigate("/free-ready")} className="rounded-xl border bg-card p-3 text-left shadow-card">
          <Sparkles className="h-4 w-4 text-secondary" />
          <p className="mt-2 text-xs text-muted-foreground">Free Ready</p>
          <p className="font-display text-lg font-black">{freeEligibleRows.length}</p>
        </button>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4 shadow-card">
        <h2 className="font-display text-lg font-bold">Order Tracking</h2>
        <p className="text-xs text-muted-foreground">Now available inside your profile.</p>

        {activeOrders.length === 0 ? (
          <div className="mt-4 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
            No active orders right now.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {activeOrders.map((order) => (
              <OrderTracker key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4 shadow-card">
        <h2 className="font-display text-lg font-bold">Loyalty Rewards</h2>
        <p className="text-xs text-muted-foreground">Buy 5 of same item, 6th is free.</p>

        {loyaltyRows.length === 0 ? (
          <div className="mt-4 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
            Start ordering to unlock rewards.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {loyaltyRows.map((row) => {
              const capped = Math.min(row.count, LOYALTY_TARGET);
              const remaining = Math.max(LOYALTY_TARGET - row.count, 0);
              const freeReady = row.count >= LOYALTY_TARGET;

              return (
                <div key={row.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">{row.name}</p>
                    <p className="text-xs font-bold text-primary">{capped}/{LOYALTY_TARGET}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: LOYALTY_TARGET }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 flex-1 rounded-full ${idx < capped ? "bg-primary" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {freeReady ? "Free item available now on next add to cart." : `${remaining} more for FREE item.`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default UserProfilePage;
