import { useEffect, useState } from "react";
import { Search, Heart, ShoppingCart, User, LogOut, LayoutDashboard, Store, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const {
    user, searchQuery, setSearchQuery, foodFilter, setFoodFilter,
    cartCount, setShowAuthModal, logout, favorites, menuItems,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const validFavoriteCount = favorites.filter((id) => menuItems.some((item) => item.id === id)).length;

  const cycleFoodFilter = () => {
    setFoodFilter((prev) => {
      if (prev === "all") return "veg";
      if (prev === "veg") return "nonveg";
      return "all";
    });
  };

  useEffect(() => {
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  const allFilterBadge = (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-veg bg-veg/10">
      <span className="h-2 w-2 rounded-full bg-nonveg" />
    </span>
  );

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container flex items-center gap-2 py-3 md:gap-4">
        <Link to="/" className="mr-1 flex items-center gap-2 flex-shrink-0 font-display text-xl font-black tracking-tight md:text-2xl">
          <img src="/famFood6_Logo_nobg.png" alt="famFood6 logo" className="h-8 w-8 rounded-full object-cover" />
          <span className="text-primary">fam</span>
          <span className="text-secondary">Food</span>
          <span className="text-primary">6</span>
        </Link>

        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-card"
          />
        </div>

        <button
          onClick={() => setIsMobileSearchOpen((prev) => !prev)}
          className={`rounded-full p-2 transition-colors md:hidden ${
            isMobileSearchOpen ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
          title="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        <div className="hidden items-center rounded-full border bg-muted/30 p-1 md:flex">
          <button
            onClick={() => setFoodFilter("veg")}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-all sm:px-2.5 ${
              foodFilter === "veg"
                ? "border border-veg/50 bg-veg/15 text-veg"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title="Pure Veg"
          >
            <span className="veg-badge" />
            <span className="hidden sm:inline">Pure Veg</span>
          </button>

          <button
            onClick={() => setFoodFilter("nonveg")}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-all sm:px-2.5 ${
              foodFilter === "nonveg"
                ? "border border-nonveg/50 bg-nonveg/15 text-nonveg"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title="Non Veg"
          >
            <span className="nonveg-badge" />
            <span className="hidden sm:inline">Non Veg</span>
          </button>

          <button
            onClick={() => setFoodFilter("all")}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-all sm:px-2.5 ${
              foodFilter === "all"
                ? "border border-veg/40 bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title="All"
          >
            {allFilterBadge}
            <span className="hidden sm:inline">All</span>
          </button>
        </div>

        <button
          onClick={cycleFoodFilter}
          className={`flex h-9 w-9 items-center justify-center rounded-full border p-0 transition-all md:hidden ${
            foodFilter === "veg"
              ? "border-veg/50 bg-veg/15 text-veg"
              : foodFilter === "nonveg"
              ? "border-nonveg/50 bg-nonveg/15 text-nonveg"
              : "border-veg/40 bg-muted text-foreground"
          }`}
          title="Tap to switch filter"
          aria-label={`Food filter: ${foodFilter}`}
        >
          {foodFilter === "veg" ? (
            <span className="veg-badge" />
          ) : foodFilter === "nonveg" ? (
            <span className="nonveg-badge" />
          ) : (
            allFilterBadge
          )}
        </button>

        <Link to="/favorites" className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Heart className="h-5 w-5" />
          {validFavoriteCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
              {validFavoriteCount}
            </span>
          )}
        </Link>

        <Link to="/cart" className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground"
            >
              {cartCount}
            </motion.span>
          )}
        </Link>

        {user ? (
          <div className="flex items-center gap-1">
            <Link
              to="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-transform hover:scale-105"
              title="Profile"
            >
              {(user.username || user.phone || "U")[0].toUpperCase()}
            </Link>
            <button onClick={() => logout()} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:shadow-glow-primary"
          >
            <span className="hidden sm:inline">Login</span>
            <User className="h-4 w-4 sm:hidden" />
          </button>
        )}
      </div>

        {isMobileSearchOpen && (
          <div className="container pb-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full rounded-full border bg-muted/50 py-2 pl-10 pr-10 text-sm outline-none transition-colors focus:border-primary focus:bg-card"
              />
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                title="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </motion.header>

      {user?.isAdmin && (
        <button
          onClick={() => navigate(isAdminRoute ? "/" : "/admin")}
          className="fixed bottom-4 right-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-primary text-primary-foreground shadow-elevated transition-all hover:scale-105 hover:shadow-glow-primary md:bottom-6 md:right-6"
          title={isAdminRoute ? "Go to user app" : "Go to admin dashboard"}
        >
          {isAdminRoute ? <Store className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
        </button>
      )}
    </>
  );
};

export default Header;
