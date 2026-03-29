import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useApp, Order } from "@/context/AppContext";

const playNotification = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
};

const showBrowserNotification = (order: Order) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const notification = new Notification("New Order Received", {
      body: `#${order.order_number} | ${order.customer_phone || "Customer"} | Rs ${order.total}`,
      icon: "/famFood6_Logo_nobg.png",
      tag: `order-${order.id}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {}
};

/**
 * Global admin order notifier – mounted once in App.tsx.
 * Shows the new-order popup from ANY page as long as user is admin.
 */
const AdminOrderNotifier = () => {
  const { user, orders, updateOrderStatus } = useApp();
  const [pendingPopups, setPendingPopups] = useState<Order[]>([]);
  const [prepTimeInput, setPrepTimeInput] = useState("20");

  const hasInitializedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const mergeQueue = (prev: Order[], incoming: Order[]) => {
    const byId = new Map<string, Order>();
    for (const order of prev) {
      if (order?.id) byId.set(order.id, order);
    }
    for (const order of incoming) {
      if (order?.id) byId.set(order.id, order);
    }
    return Array.from(byId.values());
  };

  // When user logs out or is not admin, clear state
  useEffect(() => {
    if (!user?.isAdmin) {
      setPendingPopups([]);
      hasInitializedRef.current = false;
      seenIdsRef.current = new Set();
    }
  }, [user?.isAdmin]);

  // Ask browser notification permission for admin users.
  useEffect(() => {
    if (!user?.isAdmin) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, [user?.isAdmin]);

  useEffect(() => {
    if (!user?.isAdmin) return;

    const pendingOrders = orders.filter((o) => o?.status === "pending" && typeof o.id === "string");
    const pendingIds = new Set(pendingOrders.map((o) => o.id));

    // Remove popup entries if order is no longer pending.
    setPendingPopups((prev) => prev.filter((p) => pendingIds.has(p.id)));

    if (!hasInitializedRef.current) {
      // First admin load should still show existing pending orders.
      setPendingPopups((prev) => mergeQueue(prev, pendingOrders));

      if (pendingOrders.length > 0) {
        playNotification();
        if (typeof document !== "undefined" && document.hidden) {
          pendingOrders.forEach((order) => showBrowserNotification(order));
        }
      }

      seenIdsRef.current = new Set(pendingOrders.map((o) => o.id));
      hasInitializedRef.current = true;
      return;
    }

    const newOnes = pendingOrders.filter((o) => !seenIdsRef.current.has(o.id));
    if (newOnes.length > 0) {
      newOnes.forEach((o) => seenIdsRef.current.add(o.id));
      playNotification();
      if (typeof document !== "undefined" && document.hidden) {
        newOnes.forEach((order) => showBrowserNotification(order));
      }
      setPendingPopups((prev) => mergeQueue(prev, newOnes));
    }
  }, [orders, user?.isAdmin]);

  // Don't render the popup on admin page itself – AdminDashboard handles actions there
  // Actually render everywhere: admin needs notification even on home page
  if (!user?.isAdmin || pendingPopups.length === 0) return null;

  const order = pendingPopups.find((o) => o && typeof o.id === "string");
  if (!order) return null;
  const safeItems = (Array.isArray(order.items) ? order.items : []).filter(
    (item): item is NonNullable<(typeof order.items)[number]> => Boolean(item && typeof item === "object")
  );

  const handleAccept = async (orderId: string) => {
    await updateOrderStatus(orderId, "accepted", parseInt(prepTimeInput) || 20);
    setPendingPopups((prev) => prev.filter((p) => p.id !== orderId));
    setPrepTimeInput("20");
  };

  const handleReject = async (orderId: string) => {
    await updateOrderStatus(orderId, "rejected");
    setPendingPopups((prev) => prev.filter((p) => p.id !== orderId));
  };

  return (
    <>
      {/* New order popup */}
      <AnimatePresence>
        {pendingPopups.length > 0 && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-card p-6 shadow-elevated"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-secondary animate-bounce" />
                <h2 className="font-display text-xl font-bold">New Order!</h2>
                {pendingPopups.length > 1 && (
                  <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                    +{pendingPopups.length - 1} more
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-muted/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-base">#{order.order_number}</p>
                  <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
                    {String(order.payment_method || "cash").toUpperCase()}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {order.customer_name || "Customer"} • {order.customer_phone || "N/A"}
                </p>
                <ul className="mt-2 space-y-1 border-t pt-2">
                  {safeItems.length === 0 && (
                    <li className="text-xs text-muted-foreground">No items available for this order.</li>
                  )}
                  {safeItems.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{item?.menu_item?.name || "Item"} ×{item?.quantity || 1}</span>
                      <span className="font-semibold">₹{(Number(item?.price_at_order) || 0) * (Number(item?.quantity) || 1)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{order.total}</span>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Estimated Prep Time (min)
                </label>
                <input
                  type="number"
                  value={prepTimeInput}
                  onChange={(e) => setPrepTimeInput(e.target.value)}
                  className="w-full rounded-lg border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleAccept(order.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:shadow-glow-primary"
                >
                  <CheckCircle className="h-4 w-4" /> Accept
                </button>
                <button
                  onClick={() => handleReject(order.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive py-3 text-sm font-bold text-destructive-foreground"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminOrderNotifier;
