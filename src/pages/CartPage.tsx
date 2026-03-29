import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, CreditCard, Banknote, ArrowLeft, CheckCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, placeOrder, user, setShowAuthModal } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [showPaymentSim, setShowPaymentSim] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!user) { setShowAuthModal(true); return; }
    setPlacing(true);
    try {
      if (paymentMethod === "online") {
        setShowPaymentSim(true);
        await new Promise((r) => setTimeout(r, 2500));
        const order = await placeOrder("online");
        setShowPaymentSim(false);
        setOrderPlaced(order.order_number);
      } else {
        const order = await placeOrder("cash");
        setOrderPlaced(order.order_number);
      }
    } catch (e) {
      console.error("Order failed:", e);
    } finally {
      setPlacing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <CheckCircle className="h-20 w-20 text-primary" />
        </motion.div>
        <h2 className="mt-4 font-display text-2xl font-bold">Order Placed!</h2>
        <p className="mt-1 text-muted-foreground">Order #{orderPlaced}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => navigate("/orders")} className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-primary-foreground">
            Track Order
          </button>
          <button onClick={() => navigate("/")} className="rounded-lg border px-6 py-2 text-sm font-bold text-foreground">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12">
        <p className="text-6xl">🛒</p>
        <h2 className="mt-4 font-display text-xl font-bold">Your cart is empty</h2>
        <button onClick={() => navigate("/")} className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-bold text-primary-foreground">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-6">
      <button onClick={() => navigate("/")} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </button>
      <h1 className="mb-4 font-display text-2xl font-bold">Your Cart</h1>

      <div className="space-y-3">
        <AnimatePresence>
          {cart.map((c) => (
            <motion.div
              key={c.item.id}
              layout
              exit={{ opacity: 0, x: -100 }}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-card"
            >
              <img src={c.item.image} alt={c.item.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-display text-sm font-bold">{c.item.name}</h3>
                <p className="text-sm font-semibold text-primary">₹{c.item.price * c.quantity}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border px-1">
                <button onClick={() => updateCartQuantity(c.item.id, c.quantity - 1)} className="p-1"><Minus className="h-3.5 w-3.5" /></button>
                <span className="min-w-[1.5rem] text-center text-sm font-bold">{c.quantity}</span>
                <button onClick={() => updateCartQuantity(c.item.id, c.quantity + 1)} className="p-1"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <button onClick={() => removeFromCart(c.item.id)} className="p-1 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4 shadow-card">
        <h3 className="mb-3 font-display text-sm font-bold">Payment Method</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMethod("cash")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-semibold transition-all ${
              paymentMethod === "cash" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            <Banknote className="h-5 w-5" /> Cash
          </button>
          <button
            onClick={() => setPaymentMethod("online")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-semibold transition-all ${
              paymentMethod === "online" ? "border-secondary bg-secondary/5 text-secondary" : "border-border text-muted-foreground"
            }`}
          >
            <CreditCard className="h-5 w-5" /> UPI / Online
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-card p-4 shadow-card">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">₹{cartTotal}</span>
        </div>
        <div className="mt-3 border-t pt-3 flex justify-between">
          <span className="font-display font-bold">Total</span>
          <span className="font-display text-lg font-black text-primary">₹{cartTotal}</span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handlePlaceOrder}
        disabled={placing}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-4 text-sm font-bold text-primary-foreground shadow-glow-primary disabled:opacity-50"
      >
        {placing ? "Placing..." : `Place Order • ₹${cartTotal}`}
      </motion.button>

      <AnimatePresence>
        {showPaymentSim && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-2xl bg-card p-8 text-center shadow-elevated"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="text-5xl animate-spin-slow">💳</div>
              <p className="mt-4 font-display text-lg font-bold">Processing Payment...</p>
              <p className="mt-1 text-sm text-muted-foreground">Simulating UPI payment</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
