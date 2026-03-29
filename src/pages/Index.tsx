import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import ItemCard from "@/components/ItemCard";
import SkeletonCard from "@/components/SkeletonCard";
import { motion } from "framer-motion";

const DEFAULT_SECTION_ICONS: Record<string, string> = {
  All: "/section-icons/all.svg",
  Mains: "/section-icons/mains.svg",
  Starters: "/section-icons/starters.svg",
  Breads: "/section-icons/breads.svg",
  Desserts: "/section-icons/desserts.svg",
  Beverages: "/section-icons/beverages.svg",
  Combos: "/section-icons/combos.svg",
};

const isImageSource = (value?: string) => {
  if (!value) return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  );
};

const resolveSectionIcon = (sectionName: string, icon?: string) => {
  if (isImageSource(icon)) return icon!.trim();
  return DEFAULT_SECTION_ICONS[sectionName] || "/section-icons/all.svg";
};

const Index = () => {
  const { filteredItems, menuItems } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("All");

  const sectionTabs = useMemo(() => {
    const sectionIconMap = new Map<string, string>();

    menuItems.forEach((item) => {
      const section = item.section?.trim();
      if (!section) return;

      const existing = sectionIconMap.get(section);
      const candidate = item.sectionIcon?.trim();

      if (!existing) {
        sectionIconMap.set(section, resolveSectionIcon(section, candidate));
      }
    });

    return [
      { name: "All", icon: DEFAULT_SECTION_ICONS.All },
      ...Array.from(sectionIconMap.entries()).map(([name, icon]) => ({
        name,
        icon: resolveSectionIcon(name, icon),
      })),
    ];
  }, [menuItems]);

  const sectionItems = useMemo(() => {
    if (activeSection === "All") return filteredItems;
    return filteredItems.filter((item) => item.section === activeSection);
  }, [activeSection, filteredItems]);

  useEffect(() => {
    if (menuItems.length > 0) setLoading(false);
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [menuItems]);

  useEffect(() => {
    if (!sectionTabs.some((tab) => tab.name === activeSection)) {
      setActiveSection("All");
    }
  }, [activeSection, sectionTabs]);

  return (
    <main className="container py-6">
        <motion.div
          className="mb-8 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl font-black text-primary-foreground md:text-4xl">
            Homemade with ❤️
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/80 md:text-base">
            Fresh family recipes delivered to your door
          </p>
        </motion.div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {sectionTabs.map((section) => (
            <button
              key={section.name}
              onClick={() => setActiveSection(section.name)}
              className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                activeSection === section.name
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:border-primary hover:text-primary"
              }`}
            >
              <img
                src={section.icon}
                alt={`${section.name} icon`}
                className="mr-1 inline-block h-4 w-4 rounded-full object-cover"
              />
              <span>{section.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : sectionItems.map((item, i) => <ItemCard key={item.id} item={item} index={i} />)
          }
        </div>

        {!loading && sectionItems.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-5xl">🍽️</p>
            <p className="mt-3 font-display text-lg font-bold text-muted-foreground">No dishes found</p>
          </div>
        )}
      </main>
  );
};

export default Index;
