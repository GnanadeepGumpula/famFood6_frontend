import { useState } from "react";
import { Heart, Plus, Minus, Gift, Info, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp, MenuItem } from "@/context/AppContext";

const ItemCard = ({ item, index }: { item: MenuItem; index: number }) => {
  const { addToCart, cart, updateCartQuantity, toggleFavorite, favorites, loyaltyMap } = useApp();
  const cartItem = cart.find((c) => c.item.id === item.id);
  const isFav = favorites.includes(item.id);
  // Backend loyalty is keyed by item name
  const loyalty = loyaltyMap[item.name] || 0;
  const loyaltyMax = 5;
  const isFreeEligible = loyalty >= loyaltyMax;
  const remainingForFree = Math.max(loyaltyMax - loyalty, 0);
  const [showRewardInfo, setShowRewardInfo] = useState(false);

  return (
    <>
      <motion.div
        className="group relative overflow-hidden rounded-lg border bg-card shadow-card transition-shadow hover:shadow-elevated"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {item.offers && (
            <span className="absolute left-2 top-2 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
              {item.offers}
            </span>
          )}
          <button
            onClick={() => toggleFavorite(item.id)}
            className="absolute right-2 top-2 rounded-full bg-card/80 p-1.5 backdrop-blur-sm transition-colors"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
          </button>
          <span className={`absolute bottom-2 left-2 ${item.category === "veg" ? "veg-badge" : "nonveg-badge"}`} />
        </div>

        <div className="p-3">
          <h3 className="font-display text-sm font-bold leading-tight">{item.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.description}</p>

          <div className="mt-2 rounded-md border bg-muted/20 px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Free tracker</span>
                <button
                  type="button"
                  aria-label="How loyalty tracker works"
                  onClick={() => setShowRewardInfo(true)}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">{Math.min(loyalty, loyaltyMax)}/{loyaltyMax}</span>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {Array.from({ length: loyaltyMax }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-3 rounded-full ${i < loyalty ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {isFreeEligible ? "Free reward ready now" : `${remainingForFree} more to unlock free`}
              </span>
            </div>

          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-display text-base font-black text-foreground">₹{item.price}</span>

            {isFreeEligible ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(item)}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-glow-primary"
              >
                <Gift className="h-3.5 w-3.5" /> CLAIM FREE
              </motion.button>
            ) : cartItem ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary/5 px-1">
                <button onClick={() => updateCartQuantity(item.id, cartItem.quantity - 1)} className="p-1 text-primary">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[1.25rem] text-center text-sm font-bold text-primary">{cartItem.quantity}</span>
                <button onClick={() => addToCart(item)} className="p-1 text-primary">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(item)}
                className="rounded-lg border border-primary bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                ADD
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showRewardInfo && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowRewardInfo(false)}
        >
          <motion.div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-elevated"
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-primary/20 via-secondary/25 to-primary/20 px-4 py-3">
              <button
                type="button"
                onClick={() => setShowRewardInfo(false)}
                className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-card/70"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <Sparkles className="h-4 w-4" /> famFood6 Reward Magic
              </p>
            </div>

            <div className="space-y-2 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">
                Keep ordering your favorite dish and unlock a surprise from our famFood6 kitchen.
              </p>
              <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-bold text-primary">
                Every 6th order of this same product is FREE.
              </p>
              <p className="text-xs text-muted-foreground">
                We count orders product-wise, so each item has its own reward journey.
              </p>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ItemCard;
