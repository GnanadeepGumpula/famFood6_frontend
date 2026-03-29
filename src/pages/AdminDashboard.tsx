import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, X,
  ChefHat, Package, Truck, CheckCircle, Clock,
  RotateCcw, Search, AlertCircle, ShoppingBag,
  TrendingUp, LayoutDashboard, ListOrdered, BookOpen, Utensils,
} from "lucide-react";
import { useApp, MenuItem, Order } from "@/context/AppContext";

type Tab = "overview" | "orders" | "history" | "menu";
const DEFAULT_MENU_SECTIONS = ["Mains", "Starters", "Breads", "Desserts", "Beverages", "Combos"];
const DEFAULT_SECTION_ICONS: Record<string, string> = {
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

const normalizeSectionName = (value?: string) => (value || "").trim().replace(/\s+/g, " ");

const getOrderItemsSummary = (order: Order): string => {
  const items = Array.isArray(order.items) ? order.items : [];
  const summary = items
    .filter((i) => i && typeof i === "object")
    .map((i) => `${i.menu_item?.name || "Item"} x${i.quantity || 1}`)
    .join(", ");
  return summary || "No items";
};

// Stat Card
const StatCard = ({
  icon: Icon, label, value, sub, accent = false,
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent?: boolean;
}) => (
  <div className={`rounded-xl border bg-card p-4 shadow-card ${accent ? "border-primary/30 bg-primary/5" : ""}`}>
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className={`h-4 w-4 ${accent ? "text-primary" : ""}`} />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className={`mt-2 font-display text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
    {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
  </div>
);

// Order Card
const OrderCard = ({ order, children }: { order: Order; children?: React.ReactNode }) => {
  const statusColors: Record<string, string> = {
    pending: "bg-secondary/10 text-secondary",
    accepted: "bg-blue-500/10 text-blue-600",
    cooking: "bg-orange-500/10 text-orange-600",
    packing: "bg-yellow-500/10 text-yellow-600",
    ready: "bg-green-500/10 text-green-600",
    delivered: "bg-emerald-500/10 text-emerald-600",
    rejected: "bg-destructive/10 text-destructive",
  };
  return (
    <motion.div layout className="rounded-xl border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display text-sm font-bold">#{order.order_number}</h4>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] || ""}`}>
              {order.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{order.customer_name} | {order.customer_phone}</p>
          <p className="mt-1 text-xs text-muted-foreground">{getOrderItemsSummary(order)}</p>
          <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
            <span className="font-bold text-primary">Rs {order.total}</span>
            <span className="text-muted-foreground">{String(order.payment_method || "cash").toUpperCase()}</span>
            {order.prep_time && (
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <Clock className="h-3 w-3" /> {order.prep_time}m
              </span>
            )}
            {order.created_at && (
              <span className="text-muted-foreground">
                {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
      </div>
      {children}
    </motion.div>
  );
};

// Overview Tab
const OverviewTab = ({ orders, menuItems }: { orders: Order[]; menuItems: MenuItem[] }) => {
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const revenue = todayOrders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending");
  const active = orders.filter((o) => ["accepted", "cooking", "packing", "ready"].includes(o.status));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Today's Orders" value={todayOrders.length} accent />
        <StatCard icon={TrendingUp} label="Today's Revenue" value={`Rs ${revenue}`} />
        <StatCard icon={AlertCircle} label="Pending" value={pending.length} sub="need action" />
        <StatCard icon={ChefHat} label="In Kitchen" value={active.length} sub="being prepared" />
      </div>

      {active.length > 0 && (
        <div>
          <h2 className="mb-3 font-display font-bold">Active Orders</h2>
          <div className="space-y-2">
            {active.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                <div>
                  <span className="font-bold">#{order.order_number}</span>
                  <span className="ml-2 text-muted-foreground">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">Rs {order.total}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 font-display font-bold">Menu Overview</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard icon={Utensils} label="Total Items" value={menuItems.length} />
          <StatCard icon={CheckCircle} label="Available" value={menuItems.filter((m) => m.is_available !== false).length} />
          <StatCard icon={ShoppingBag} label="Veg Items" value={menuItems.filter((m) => m.category === "veg").length} />
        </div>
      </div>
    </div>
  );
};

// Live Orders Tab
const LiveOrdersTab = ({
  orders,
  updateOrderStatus,
}: {
  orders: Order[];
  updateOrderStatus: (id: string, status: Order["status"], prepTime?: number) => Promise<void>;
}) => {
  const [pinInput, setPinInput] = useState("");
  const [pinOrderId, setPinOrderId] = useState<string | null>(null);
  const [pinError, setPinError] = useState("");

  const pending = orders.filter((o) => o.status === "pending");
  const active = orders.filter((o) => ["accepted", "cooking", "packing", "ready"].includes(o.status));

  const statusActions: Record<string, { next: Order["status"]; label: string; icon: React.ElementType }> = {
    accepted: { next: "cooking", label: "Start Cooking", icon: ChefHat },
    cooking: { next: "packing", label: "Cooking Done", icon: Package },
    packing: { next: "ready", label: "Packing Done", icon: Truck },
    ready: { next: "delivered", label: "Mark Delivered", icon: CheckCircle },
  };

  const handleDelivered = (orderId: string) => {
    setPinOrderId(orderId);
    setPinInput("");
    setPinError("");
  };

  const confirmDelivery = async () => {
    const order = orders.find((o) => o.id === pinOrderId);
    if (order && pinInput === order.delivery_pin) {
      await updateOrderStatus(pinOrderId!, "delivered");
      setPinOrderId(null);
    } else {
      setPinError("Invalid PIN");
    }
  };

  useEffect(() => {
    if (!pinOrderId || pinInput.length !== 4) return;
    void confirmDelivery();
  }, [pinInput, pinOrderId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 font-display font-bold text-secondary flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Pending Orders
          {pending.length > 0 && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">{pending.length}</span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending orders</p>
        ) : (
          <div className="space-y-3">
            {pending.map((order) => (
              <OrderCard key={order.id} order={order}>
                <p className="mt-2 text-xs text-muted-foreground italic">Waiting to be accepted - accept or reject via the popup notification</p>
              </OrderCard>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-display font-bold text-primary flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Kitchen Pipeline
          {active.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{active.length}</span>
          )}
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active orders</p>
        ) : (
          <div className="space-y-3">
            {active.map((order) => {
              const action = statusActions[order.status];
              return (
                <OrderCard key={order.id} order={order}>
                  {action && (
                    <button
                      onClick={() => action.next === "delivered" ? handleDelivered(order.id) : updateOrderStatus(order.id, action.next)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:shadow-glow-primary transition-shadow"
                    >
                      <action.icon className="h-4 w-4" /> {action.label}
                    </button>
                  )}
                </OrderCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Delivery PIN modal */}
      <AnimatePresence>
        {pinOrderId && (
          <motion.div className="fixed inset-0 z-[85] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-xs rounded-2xl bg-card p-6 shadow-elevated text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <h3 className="font-display text-lg font-bold">Enter Delivery PIN</h3>
              <p className="mt-1 text-xs text-muted-foreground">Ask the customer for their 4-digit PIN. It auto-verifies after 4 digits.</p>
              {pinError && <p className="mt-2 text-xs font-semibold text-destructive">{pinError}</p>}
              <input
                type="text" maxLength={4} value={pinInput}
                onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, "")); setPinError(""); }}
                className="mx-auto mt-4 block w-32 rounded-lg border bg-muted/30 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-primary"
              />
              <div className="mt-4 flex gap-3">
                <button onClick={() => setPinOrderId(null)} className="flex-1 rounded-lg border py-2 text-sm font-semibold">Cancel</button>
                <button onClick={confirmDelivery} className="flex-1 rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// History Tab
const HistoryTab = ({ orders }: { orders: Order[] }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "delivered" | "rejected">("all");

  const history = useMemo(() => {
    return orders
      .filter((o) => ["delivered", "rejected"].includes(o.status))
      .filter((o) => {
        if (filter !== "all" && o.status !== filter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          o.order_number.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          (o.customer_name || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, filter, search]);

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const rejectedCount = orders.filter((o) => o.status === "rejected").length;
  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={CheckCircle} label="Delivered" value={deliveredCount} accent />
        <StatCard icon={X} label="Rejected" value={rejectedCount} />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`Rs ${totalRevenue}`} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" placeholder="Search by order#, name or phone..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-muted/30 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(["all", "delivered", "rejected"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders found</p>
      ) : (
        <div className="space-y-3">
          {history.map((order) => (
            <OrderCard key={order.id} order={order}>
              {order.status === "rejected" && order.payment_method === "online" && (
                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-secondary py-2 text-xs font-semibold text-secondary">
                  <RotateCcw className="h-3.5 w-3.5" /> Initiate Refund
                </button>
              )}
            </OrderCard>
          ))}
        </div>
      )}
    </div>
  );
};

// Menu Tab
const MenuTab = ({
  menuItems, addMenuItem, updateMenuItem, deleteMenuItem,
}: {
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
}) => {
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageDropActive, setImageDropActive] = useState(false);
  const [sectionLogoDropActive, setSectionLogoDropActive] = useState(false);
  const [formData, setFormData] = useState({
    name: "", price: "", image: "", category: "veg" as "veg" | "nonveg",
    description: "", offers: "", section: "Mains", sectionIcon: "/section-icons/mains.svg", customSection: "", customSectionIcon: "", is_available: true,
  });

  const sectionIconMap = useMemo(() => {
    const map = new Map<string, string>();

    menuItems.forEach((item) => {
      const section = item.section?.trim();
      if (!section) return;

      const icon = item.sectionIcon?.trim();
      if (icon) {
        map.set(section, resolveSectionIcon(section, icon));
        return;
      }

      if (!map.has(section)) {
        map.set(section, resolveSectionIcon(section));
      }
    });

    DEFAULT_MENU_SECTIONS.forEach((section) => {
      if (!map.has(section)) {
        map.set(section, resolveSectionIcon(section));
      }
    });

    return map;
  }, [menuItems]);

  const getSectionIcon = (section: string) => sectionIconMap.get(section) || resolveSectionIcon(section);

  const sectionOptions = useMemo(() => {
    const fromMenu = menuItems
      .map((item) => normalizeSectionName(item.section))
      .filter((section): section is string => Boolean(section));
    return Array.from(new Set([...DEFAULT_MENU_SECTIONS, ...fromMenu]));
  }, [menuItems]);

  const filtered = useMemo(() => {
    if (!search.trim()) return menuItems;
    const q = search.toLowerCase();
    return menuItems.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.includes(q) ||
        (m.section || "").toLowerCase().includes(q)
    );
  }, [menuItems, search]);

  const applyImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload a valid image file.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setImageError("Image too large. Use a file up to 1.5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setImageError("Could not read image file.");
        return;
      }
      setImageError("");
      setFormData((p) => ({ ...p, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const applySectionLogoFile = (file: File, target: "section" | "custom") => {
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload a valid section logo image.");
      return;
    }
    if (file.size > 500 * 1024) {
      setImageError("Section logo too large. Use a file up to 500 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setImageError("Could not read section logo file.");
        return;
      }
      setImageError("");
      setFormData((p) => ({
        ...p,
        ...(target === "section" ? { sectionIcon: result } : { customSectionIcon: result }),
      }));
    };
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    setEditItem(null);
    setImageError("");
    const defaultSection = sectionOptions.includes("Mains") ? "Mains" : sectionOptions[0] || "Mains";
    setFormData({
      name: "",
      price: "",
      image: "",
      category: "veg",
      description: "",
      offers: "",
      section: defaultSection,
      sectionIcon: getSectionIcon(defaultSection),
      customSection: "",
      customSectionIcon: "",
      is_available: true,
    });
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setImageError("");
    const normalizedSection = normalizeSectionName(item.section) || "Mains";
    const usesKnownSection = sectionOptions.includes(normalizedSection);
    setFormData({
      name: item.name, price: String(item.price), image: item.image,
      category: item.category, description: item.description,
      offers: item.offers || "",
      section: usesKnownSection ? normalizedSection : "__other__",
      sectionIcon: usesKnownSection ? (item.sectionIcon || getSectionIcon(normalizedSection)) : "",
      customSection: usesKnownSection ? "" : normalizedSection,
      customSectionIcon: usesKnownSection ? "" : (item.sectionIcon || ""),
      is_available: item.is_available !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const selectedSection = normalizeSectionName(
      formData.section === "__other__" ? formData.customSection : formData.section
    );
    const selectedSectionIcon = (formData.section === "__other__" ? formData.customSectionIcon : formData.sectionIcon).trim();

    if (!selectedSection) {
      setImageError("Please provide a section name.");
      return;
    }

    if (selectedSectionIcon && !isImageSource(selectedSectionIcon)) {
      setImageError("Section logo must be an image URL or uploaded image.");
      return;
    }

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      image: formData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      category: formData.category,
      section: selectedSection,
      sectionIcon: selectedSectionIcon || resolveSectionIcon(selectedSection),
      description: formData.description,
      offers: formData.offers || null,
      is_available: formData.is_available,
    };

    try {
      setImageError("");
      if (editItem) {
        await updateMenuItem({ ...editItem, ...payload });
      } else {
        await addMenuItem({ ...payload, inStock: formData.is_available });
      }
      setShowForm(false);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Failed to save menu item.");
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" placeholder="Search menu items..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-muted/30 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button onClick={openAdd} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:shadow-glow-primary sm:w-auto">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card">
            <img src={item.image} alt={item.name} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={item.category === "veg" ? "veg-badge" : "nonveg-badge"} />
                <h3 className="truncate font-display text-sm font-bold">{item.name}</h3>
              </div>
              <p className="text-sm font-semibold text-primary">Rs {item.price}</p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>Section:</span>
                <img
                  src={resolveSectionIcon(item.section || "Mains", item.sectionIcon || getSectionIcon(item.section || "Mains"))}
                  alt={`${item.section || "Mains"} logo`}
                  className="h-4 w-4 rounded-full object-cover"
                />
                <span>{item.section || "Mains"}</span>
              </p>
              {item.is_available === false && <span className="text-xs font-medium text-destructive">Out of stock</span>}
            </div>
            <div className="flex flex-shrink-0 gap-1">
              <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => deleteMenuItem(item.id)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-[85] overflow-y-auto bg-foreground/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
            <motion.div className="mx-auto my-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-elevated max-h-[calc(100vh-2rem)] overflow-y-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between sticky top-0 bg-card pb-2">
                <h3 className="font-display text-lg font-bold">{editItem ? "Edit Item" : "Add New Item"}</h3>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3 pr-1">
                <input placeholder="Item name *" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                <input placeholder="Price (Rs) *" type="number" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                <div
                  className={`rounded-lg border-2 border-dashed p-3 text-center transition-colors ${
                    imageDropActive ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                  }`}
                  onDragEnter={(e) => { e.preventDefault(); setImageDropActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setImageDropActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setImageDropActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImageDropActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) applyImageFile(file);
                  }}
                >
                  <p className="text-xs font-medium text-muted-foreground">Drag and drop image here</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">or choose from local storage</p>
                  <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) applyImageFile(file);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mx-auto mt-3 h-20 w-20 rounded-lg border object-cover" />
                  )}
                </div>
                <input placeholder="Image URL (optional alternative)" value={formData.image.startsWith("data:") ? "" : formData.image} onChange={(e) => { setImageError(""); setFormData((p) => ({ ...p, image: e.target.value })); }} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) => {
                        const nextSection = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          section: nextSection,
                          sectionIcon: nextSection === "__other__" ? p.sectionIcon : getSectionIcon(nextSection),
                          customSection: nextSection === "__other__" ? p.customSection : "",
                          customSectionIcon: nextSection === "__other__" ? p.customSectionIcon : "",
                        }));
                        setImageError("");
                      }}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {sectionOptions.map((section) => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                      <option value="__other__">Other...</option>
                    </select>
                  </div>
                  {formData.section !== "__other__" && (
                    <div className="space-y-2">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Section Logo Image</label>
                      <input
                        placeholder="Section logo URL (optional)"
                        value={formData.sectionIcon.startsWith("data:") ? "" : formData.sectionIcon}
                        onChange={(e) => setFormData((p) => ({ ...p, sectionIcon: e.target.value.trim() }))}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <div
                        className={`rounded-lg border-2 border-dashed p-2 text-center transition-colors ${
                          sectionLogoDropActive ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        }`}
                        onDragEnter={(e) => { e.preventDefault(); setSectionLogoDropActive(true); }}
                        onDragOver={(e) => { e.preventDefault(); setSectionLogoDropActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setSectionLogoDropActive(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setSectionLogoDropActive(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) applySectionLogoFile(file, "section");
                        }}
                      >
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold hover:border-primary hover:text-primary">
                          Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) applySectionLogoFile(file, "section");
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <p className="mt-1 text-[10px] text-muted-foreground">Square image works best</p>
                      </div>
                      <img
                        src={resolveSectionIcon(formData.section, formData.sectionIcon)}
                        alt="Section logo preview"
                        className="h-10 w-10 rounded-full border object-cover"
                      />
                    </div>
                  )}
                  {formData.section === "__other__" && (
                    <div className="space-y-2">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">New Section Name</label>
                      <input
                        placeholder="e.g. Combos"
                        value={formData.customSection}
                        onChange={(e) => setFormData((p) => ({ ...p, customSection: e.target.value }))}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <label className="mb-1 mt-2 block text-xs font-medium text-muted-foreground">New Section Logo Image</label>
                      <input
                        placeholder="New section logo URL (optional)"
                        value={formData.customSectionIcon.startsWith("data:") ? "" : formData.customSectionIcon}
                        onChange={(e) => setFormData((p) => ({ ...p, customSectionIcon: e.target.value.trim() }))}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <div
                        className={`rounded-lg border-2 border-dashed p-2 text-center transition-colors ${
                          sectionLogoDropActive ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        }`}
                        onDragEnter={(e) => { e.preventDefault(); setSectionLogoDropActive(true); }}
                        onDragOver={(e) => { e.preventDefault(); setSectionLogoDropActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setSectionLogoDropActive(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setSectionLogoDropActive(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) applySectionLogoFile(file, "custom");
                        }}
                      >
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold hover:border-primary hover:text-primary">
                          Upload New Section Logo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) applySectionLogoFile(file, "custom");
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <p className="mt-1 text-[10px] text-muted-foreground">Square image works best</p>
                      </div>
                      {(formData.customSectionIcon || formData.customSection) && (
                        <img
                          src={resolveSectionIcon(formData.customSection || "Mains", formData.customSectionIcon)}
                          alt="New section logo preview"
                          className="h-10 w-10 rounded-full border object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
                <textarea placeholder="Description" rows={2} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                <input placeholder="Offer text (optional)" value={formData.offers} onChange={(e) => setFormData((p) => ({ ...p, offers: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                <div className="flex gap-3">
                  <button onClick={() => setFormData((p) => ({ ...p, category: "veg" }))} className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold transition-colors ${formData.category === "veg" ? "border-veg text-veg" : "border-border text-muted-foreground"}`}>Veg</button>
                  <button onClick={() => setFormData((p) => ({ ...p, category: "nonveg" }))} className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold transition-colors ${formData.category === "nonveg" ? "border-nonveg text-nonveg" : "border-border text-muted-foreground"}`}>Non-Veg</button>
                </div>
                {imageError && <p className="text-xs font-semibold text-destructive">{imageError}</p>}
                <label className="flex cursor-pointer items-center gap-2">
                  <div onClick={() => setFormData((p) => ({ ...p, is_available: !p.is_available }))} className={`relative h-6 w-11 rounded-full transition-colors ${formData.is_available ? "bg-primary" : "bg-muted-foreground/40"}`}>
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${formData.is_available ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium">{formData.is_available ? "In Stock" : "Out of Stock"}</span>
                </label>
                <button onClick={handleSubmit} className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:shadow-glow-primary">
                  {editItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Component

const AdminDashboard = () => {
  const { menuItems, orders, addMenuItem, updateMenuItem, deleteMenuItem, updateOrderStatus } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Live Orders", icon: ListOrdered, badge: pendingCount || undefined },
    { id: "history", label: "History", icon: BookOpen },
    { id: "menu", label: "Menu", icon: Utensils },
  ];

  return (
    <div className="container py-6">
      <h1 className="mb-4 font-display text-2xl font-bold">Admin Dashboard</h1>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex min-w-[80px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {badge ? (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "overview" && <OverviewTab orders={orders} menuItems={menuItems} />}
          {tab === "orders" && <LiveOrdersTab orders={orders} updateOrderStatus={updateOrderStatus} />}
          {tab === "history" && <HistoryTab orders={orders} />}
          {tab === "menu" && (
            <MenuTab
              menuItems={menuItems}
              addMenuItem={addMenuItem}
              updateMenuItem={updateMenuItem}
              deleteMenuItem={deleteMenuItem}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
