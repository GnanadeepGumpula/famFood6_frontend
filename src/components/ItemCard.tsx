import { Heart, Plus, Minus, Gift, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useApp, MenuItem } from "@/context/AppContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ItemCard = ({ item, index }: { item: MenuItem; index: number }) => {
  const { addToCart, cart, updateCartQuantity, toggleFavorite, favorites, loyaltyMap } = useApp();
  const cartItem = cart.find((c) => c.item.id === item.id);
  const isFav = favorites.includes(item.id);
  // Backend loyalty is keyed by item name
  const loyalty = loyaltyMap[item.name] || 0;
  const loyaltyMax = 5;
  const isFreeEligible = loyalty >= loyaltyMax;
  const remainingForFree = Math.max(loyaltyMax - loyalty, 0);

  return (
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="How loyalty tracker works"
                    className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[14rem] text-xs">
                  Buy this item 5 times and your next one becomes free. We track this automatically per item.
                </TooltipContent>
              </Tooltip>
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
  );
};

export default ItemCard;
