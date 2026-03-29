import { useMemo } from "react";
import { ArrowLeft, Gift, ShoppingCart, Sparkles, User as UserIcon, Trophy, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const LOYALTY_TARGET = 5;

const FreeReadyPage = () => {
  const { user, menuItems, loyaltyMap, orders, addToCart, setShowAuthModal } = useApp();
  const navigate = useNavigate();

  const loyaltyRows = useMemo(() => {
    return menuItems
      .map((item) => {
        const count = loyaltyMap[item.name] || 0;
        return {
          item,
          count,
          remaining: Math.max(LOYALTY_TARGET - count, 0),
        };
      })
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [menuItems, loyaltyMap]);

  const freeReadyRows = useMemo(() => {
    return loyaltyRows.filter((row) => row.count >= LOYALTY_TARGET && row.item.inStock);
  }, [loyaltyRows]);

  const upcomingRows = useMemo(() => {
    return loyaltyRows.filter((row) => row.count === LOYALTY_TARGET - 1 && row.item.inStock);
  }, [loyaltyRows]);

  const claimedRows = useMemo(() => {
    const claimedByName = new Map<string, number>();

    for (const order of orders) {
      for (const orderItem of order.items) {
        if (orderItem.price_at_order !== 0) continue;
        const itemName = orderItem.menu_item.name || "Unknown Item";
        const current = claimedByName.get(itemName) || 0;
        claimedByName.set(itemName, current + orderItem.quantity);
      }
    }

    return Array.from(claimedByName.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  if (!user) {
    return (
      <main className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <UserIcon className="h-14 w-14 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold">Login to see Free Ready</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free rewards are tracked from your account order history.
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
      </main>
    );
  }

  return (
    <main className="container max-w-5xl py-6">
      <button
        onClick={() => navigate("/")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </button>

      <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary))_0%,hsl(var(--primary))_55%,hsl(var(--card))_100%)] p-6 text-white shadow-elevated">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-black/10" />
        <h1 className="font-display text-2xl font-black md:text-3xl">Free Ready</h1>
        <p className="mt-1 text-sm text-white/85">
          Buy 5 times, get 6th free. Track what is free now, what is close, and what you already claimed.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-wide text-white/80">Free Now</p>
            <p className="mt-1 font-display text-xl font-black">{freeReadyRows.length}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-wide text-white/80">Almost</p>
            <p className="mt-1 font-display text-xl font-black">{upcomingRows.length}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-wide text-white/80">Claimed</p>
            <p className="mt-1 font-display text-xl font-black">{claimedRows.reduce((sum, row) => sum + row.count, 0)}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Free Available Now</h2>
            <p className="text-xs text-muted-foreground">These menu items can be added as FREE right now.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {freeReadyRows.length}
          </span>
        </div>

        {freeReadyRows.length === 0 ? (
          <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
            No free items ready yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {freeReadyRows.map((row) => (
              <div key={row.item.id} className="rounded-xl border p-3">
                <img
                  src={row.item.image}
                  alt={row.item.name}
                  className="h-28 w-full rounded-lg object-cover"
                  loading="lazy"
                />
                <p className="mt-2 font-display text-sm font-bold">{row.item.name}</p>
                  <p className="text-xs text-muted-foreground">{LOYALTY_TARGET}/{LOYALTY_TARGET} completed</p>
                <button
                  onClick={() => addToCart({ ...row.item, price: 0 })}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-2 text-xs font-bold text-primary-foreground"
                >
                  <Gift className="h-3.5 w-3.5" /> Claim FREE
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Upcoming Free (Buy 1 More)</h2>
            <p className="text-xs text-muted-foreground">These are at 4/5. Add one more to unlock your free item.</p>
          </div>
          <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
            {upcomingRows.length}
          </span>
        </div>

        {upcomingRows.length === 0 ? (
          <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
            No items are one step away right now.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingRows.map((row) => (
              <div key={row.item.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{row.item.name}</p>
                  <p className="text-xs text-muted-foreground">{row.count}/{LOYALTY_TARGET} done - buy {row.remaining} more</p>
                  <div className="mt-1 flex gap-1">
                    {Array.from({ length: LOYALTY_TARGET }).map((_, idx) => (
                      <span key={idx} className={`h-1.5 w-5 rounded-full ${idx < row.count ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => addToCart(row.item)}
                  className="flex items-center gap-1 rounded-lg border border-primary bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Add 1
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Already Claimed Free Items</h2>
            <p className="text-xs text-muted-foreground">This shows all rewards you already got for free.</p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
            {claimedRows.reduce((sum, row) => sum + row.count, 0)}
          </span>
        </div>

        {claimedRows.length === 0 ? (
          <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
            No free claims yet. Keep ordering and your first free reward will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {claimedRows.map((row) => (
              <div key={row.name} className="flex items-center justify-between rounded-lg border p-3">
                <p className="text-sm font-semibold">{row.name}</p>
                <p className="flex items-center gap-1 text-xs font-bold text-primary">
                  {row.count >= 3 ? <Trophy className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />} {row.count} claimed
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default FreeReadyPage;
