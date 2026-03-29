import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, ChefHat, Package, Truck, RefreshCcw, List } from "lucide-react";
import { MenuItem, Order, useApp } from "@/context/AppContext";

const steps = [
  { key: "accepted", label: "Accepted", icon: CheckCircle2 },
  { key: "cooking", label: "Cooking", icon: ChefHat },
  { key: "packing", label: "Packing", icon: Package },
  { key: "ready", label: "Ready", icon: Truck },
];

const statusIndex: Record<string, number> = {
  accepted: 0, cooking: 1, packing: 2, ready: 3, delivered: 4,
};

const OrderTracker = ({ order }: { order: Order }) => {
  const { addToCart, menuItems, user, setShowAuthModal } = useApp();
  const currentIdx = statusIndex[order.status] ?? -1;
  const [showItems, setShowItems] = useState(false);

  const reorderableItems = useMemo(() => {
    return order.items
      .map((line) => {
        const menuId = line.menu_item?.id;
        const liveItem = menuId ? menuItems.find((m) => m.id === menuId && m.inStock) : undefined;

        if (liveItem) {
          return { line, item: liveItem };
        }

        const fallbackPrice = line.price_at_order > 0 ? line.price_at_order : line.menu_item?.price;
        if (!line.menu_item || !fallbackPrice || fallbackPrice <= 0) {
          return { line, item: null as MenuItem | null };
        }

        return {
          line,
          item: {
            ...line.menu_item,
            price: fallbackPrice,
            inStock: true,
            is_available: true,
            section: line.menu_item.section || "Mains",
          } as MenuItem,
        };
      })
      .filter((row) => row.item !== null);
  }, [order.items, menuItems]);

  const handleReorderSingle = (item: MenuItem) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    addToCart(item);
  };

  const handleReorderCombo = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    for (const row of reorderableItems) {
      if (!row.item) continue;
      for (let i = 0; i < row.line.quantity; i++) {
        addToCart(row.item);
      }
    }
  };

  return (
    <motion.div
      className="rounded-xl border bg-card p-4 shadow-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="font-display text-sm font-bold">Order #{order.order_number}</h4>
          <p className="text-xs text-muted-foreground">
            {order.items.map((i) => `${i.menu_item?.name || "Item"} x${i.quantity}`).join(", ")}
          </p>
        </div>
        <span className="font-display text-sm font-bold text-primary">₹{order.total}</span>
      </div>

      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isComplete = currentIdx > i;
          const isCurrent = currentIdx === i;
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                isComplete ? "border-primary bg-primary text-primary-foreground" :
                isCurrent ? "border-secondary bg-secondary/10 text-secondary animate-pulse-glow" :
                "border-muted bg-muted text-muted-foreground"
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`mt-1 text-[10px] font-medium ${isCurrent ? "text-secondary" : isComplete ? "text-primary" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {order.status !== "rejected" && order.status !== "pending" && (
        <div className="mt-3 flex gap-3 rounded-lg bg-muted/50 p-2 text-xs">
          <div>
            <span className="text-muted-foreground">WhatsApp Code:</span>

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setShowItems((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <List className="h-3.5 w-3.5" /> {showItems ? "Hide items" : `View items (${order.items.length})`}
          </button>
          <button
            onClick={handleReorderCombo}
            disabled={reorderableItems.length === 0}
            className="flex items-center gap-1 rounded-lg border border-primary bg-primary/5 px-2.5 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Reorder Same Combo
          </button>
        </div>

        {showItems && (
          <div className="mb-3 space-y-2 rounded-lg border bg-muted/20 p-2.5">
            {order.items.map((line, idx) => {
              const row = reorderableItems.find((r) => r.line === line);
              return (
                <div key={`${line.menu_item?.id || line.menu_item?.name || idx}-${idx}`} className="flex items-center justify-between gap-2 rounded-md bg-card px-2 py-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{line.menu_item?.name || "Item"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Qty {line.quantity} • ₹{line.price_at_order}
                    </p>
                  </div>
                  <button
                    onClick={() => row?.item && handleReorderSingle(row.item)}
                    disabled={!row?.item}
                    className="rounded-md border border-primary px-2 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reorder Item
                  </button>
                </div>
              );
            })}
          </div>
        )}
            <span className="ml-1 font-bold text-primary">{order.whatsapp_coupon}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Delivery PIN:</span>
            <span className="ml-1 font-bold text-secondary">{order.delivery_pin}</span>
          </div>
          {order.prep_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="font-bold">{order.prep_time} min</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default OrderTracker;
