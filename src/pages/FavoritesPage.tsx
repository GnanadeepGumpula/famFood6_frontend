import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import ItemCard from "@/components/ItemCard";
import { motion } from "framer-motion";

const FavoritesPage = () => {
  const { user, favorites, menuItems, setShowAuthModal } = useApp();
  const navigate = useNavigate();

  const favoriteItems = menuItems.filter((item) => favorites.includes(item.id));

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <p className="text-5xl">❤️</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Login to view favorites</h1>
        <p className="mt-1 text-sm text-muted-foreground">Save dishes you love and access them quickly.</p>
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
    <main className="container py-6">
      <button
        onClick={() => navigate("/")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </button>

      <motion.div
        className="mb-6 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 p-6 text-secondary-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-black">Your Favorites</h1>
        <p className="mt-1 text-sm text-secondary-foreground/80">
          {favoriteItems.length} saved {favoriteItems.length === 1 ? "dish" : "dishes"}
        </p>
      </motion.div>

      {favoriteItems.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <p className="mt-3 font-display text-lg font-bold text-muted-foreground">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart icon on dishes to add them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {favoriteItems.map((item, i) => (
            <ItemCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </main>
  );
};

export default FavoritesPage;
