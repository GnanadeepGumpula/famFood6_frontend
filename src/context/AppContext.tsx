import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth, AppUser, SendOtpResult } from "@/hooks/useAuth";

// ─── Frontend types (component-compatible) ────────────────────────────────────

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  /** "veg" | "nonveg" */
  category: "veg" | "nonveg";
  section: string;
  sectionIcon?: string;
  image: string;
  inStock: boolean;
  offers?: string | null;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type FoodFilter = "all" | "veg" | "nonveg";

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total: number;
  status: "pending" | "accepted" | "cooking" | "packing" | "ready" | "delivered" | "rejected";
  payment_method: "cash" | "online";
  prep_time: number | null;
  whatsapp_coupon: string;
  delivery_pin: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  items: { menu_item: MenuItem; quantity: number; price_at_order: number }[];
}

// ─── Normalise backend → frontend ─────────────────────────────────────────────

function mapMenuItem(raw: any): MenuItem {
  return {
    id: raw._id,
    name: raw.name,
    description: raw.description || "",
    price: raw.price,
    category: raw.category === "Veg" ? "veg" : "nonveg",
    section: raw.section || "Mains",
    sectionIcon: raw.sectionIcon || "",
    image: raw.imageURL || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    inStock: raw.inStock,
    offers: raw.offers ?? null,
    is_available: raw.inStock,
    created_at: raw.createdAt,
    updated_at: raw.updatedAt,
  };
}

function mapOrder(raw: any, menuCache: Map<string, MenuItem>): Order {
  const rawStatus = typeof raw?.orderStatus === "string" ? raw.orderStatus.toLowerCase() : "pending";
  const rawPaymentMethod = typeof raw?.paymentMethod === "string" ? raw.paymentMethod.toLowerCase() : "cash";
  const safeItems = Array.isArray(raw?.items) ? raw.items : [];

  return {
    id: raw._id,
    order_number: raw.tokenNumber,
    user_id: typeof raw.userId === "object" ? raw.userId?._id : raw.userId,
    total: raw.totalAmount,
    status: rawStatus as Order["status"],
    payment_method: rawPaymentMethod as Order["payment_method"],
    prep_time: raw.estimatedPrepTime ?? null,
    whatsapp_coupon: "",
    delivery_pin: raw.deliveryPIN || "",
    customer_name: "",
    customer_phone: typeof raw.userId === "object" ? raw.userId?.mobileNumber || "" : "",
    created_at: raw.createdAt,
    items: safeItems.flatMap((item: any) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const cached = menuCache.get(item.menuId?.toString());
      return [{
        menu_item: cached ?? {
          id: item.menuId?.toString() || "",
          name: item.name || "Item",
          description: "",
          price: item.price || 0,
          category: "veg" as const,
          section: "Mains",
          sectionIcon: "",
          image: "",
          inStock: true,
          is_available: true,
        },
        quantity: item.quantity || 1,
        price_at_order: item.price || 0,
      }];
    }),
  };
}

// ─── Context types ─────────────────────────────────────────────────────────────

interface AppState {
  user: AppUser | null;
  authLoading: boolean;
  cart: CartItem[];
  menuItems: MenuItem[];
  orders: Order[];
  favorites: string[];
  loyaltyMap: Record<string, number>;
  foodFilter: FoodFilter;
  searchQuery: string;
  showAuthModal: boolean;
  isAdminView: boolean;
}

interface AppContextType extends AppState {
  sendOtp: (phone: string) => Promise<SendOtpResult>;
  verifyOtp: (phone: string, token: string) => Promise<{ shouldSetupProfile: boolean }>;
  logout: () => void;
  setUsername: (name: string) => Promise<void>;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (itemId: string) => void;
  setFoodFilter: (v: FoodFilter) => void;
  setSearchQuery: (q: string) => void;
  setShowAuthModal: (v: boolean) => void;
  setIsAdminView: (v: boolean) => void;
  placeOrder: (paymentMethod: "cash" | "online") => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order["status"], prepTime?: number) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshMenu: () => Promise<void>;
  filteredItems: MenuItem[];
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

// ─── Provider ──────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, sendOtp, verifyOtp, setUsername, logout } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loyaltyMap, setLoyaltyMap] = useState<Record<string, number>>({});
  const [foodFilter, setFoodFilter] = useState<FoodFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  /** Cache of id → MenuItem to reconstruct order items without extra fetches. */
  const menuCacheRef = useRef<Map<string, MenuItem>>(new Map());

  // Auth reminder every 3 minutes if not logged in
  useEffect(() => {
    if (user || authLoading) return;
    const timer = setInterval(() => setShowAuthModal(true), 180000);
    return () => clearInterval(timer);
  }, [user, authLoading]);

  // ── Menu ──────────────────────────────────────────────────────────────────────
  const refreshMenu = useCallback(async () => {
    try {
      const data = await apiFetch('/api/menu', { cache: 'no-store' });
      const items: MenuItem[] = (data.items || []).map(mapMenuItem);
      setMenuItems(items);
      menuCacheRef.current = new Map(items.map(i => [i.id, i]));
    } catch (e) {
      console.error('Failed to load menu', e);
    }
  }, []);

  useEffect(() => { refreshMenu(); }, [refreshMenu]);

  // ── Orders ────────────────────────────────────────────────────────────────────
  const refreshOrders = useCallback(async () => {
    if (!user) { setOrders([]); return; }
    try {
      const data = await apiFetch('/api/orders?limit=50');
      setOrders((data.orders || []).map((raw: any) => mapOrder(raw, menuCacheRef.current)));
    } catch {
      setOrders([]);
    }
  }, [user]);

  useEffect(() => { refreshOrders(); }, [refreshOrders]);

  // Poll every 15 s for order status updates (replaces Supabase Realtime)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => refreshOrders(), 15000);
    return () => clearInterval(interval);
  }, [user, refreshOrders]);

  // ── Favorites (localStorage) ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    try {
      const stored = localStorage.getItem('favorites');
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch {
      setFavorites([]);
    }
  }, [user]);

  // ── Loyalty ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setLoyaltyMap({}); return; }
    apiFetch('/api/users/loyalty')
      .then(data => { if (data?.loyaltyCounter) setLoyaltyMap(data.loyaltyCounter); })
      .catch(() => {});
  }, [user]);

  // ── Admin view ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.isAdmin) setIsAdminView(false);
  }, [user?.isAdmin]);

  // ── Cart (localStorage) ───────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) setCart(parsed);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ── Cart helpers ──────────────────────────────────────────────────────────────
  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  }, []);

  const updateCartQuantity = useCallback((itemId: string, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(c => c.item.id !== itemId)); return; }
    setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, quantity: qty } : c));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ── Favorites ─────────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((itemId: string) => {
    if (!user) { setShowAuthModal(true); return; }
    setFavorites(prev => {
      const next = prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  }, [user]);

  // ── Orders ────────────────────────────────────────────────────────────────────
  const placeOrder = useCallback(async (paymentMethod: "cash" | "online"): Promise<Order> => {
    if (!user) throw new Error("Must be logged in");

    const data = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map(c => ({
          menuId: c.item.id,
          name: c.item.name,
          quantity: c.quantity,
          price: c.item.price,
        })),
        paymentMethod: paymentMethod === "cash" ? "Cash" : "Online",
      }),
    });

    setCart([]);
    // Refresh loyalty and orders in background
    refreshOrders();
    apiFetch('/api/users/loyalty').then(d => { if (d?.loyaltyCounter) setLoyaltyMap(d.loyaltyCounter); }).catch(() => {});

    return {
      id: data.orderId,
      order_number: data.tokenNumber,
      user_id: user.id,
      total: data.totalAmount,
      status: "pending",
      payment_method: paymentMethod,
      prep_time: data.estimatedPrepTime ?? null,
      whatsapp_coupon: "",
      delivery_pin: data.deliveryPIN || "",
      customer_name: user.username || "",
      customer_phone: user.phone,
      created_at: new Date().toISOString(),
      items: cart.map(c => ({ menu_item: c.item, quantity: c.quantity, price_at_order: c.item.price })),
    };
  }, [cart, user, refreshOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order["status"], prepTime?: number) => {
    // Capitalise for backend enum: "accepted" → "Accepted"
    const orderStatus = status.charAt(0).toUpperCase() + status.slice(1);
    await apiFetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        orderStatus,
        ...(prepTime !== undefined ? { estimatedPrepTime: prepTime } : {}),
      }),
    });
    await refreshOrders();
  }, [refreshOrders]);

  // ── Admin – Menu CRUD ─────────────────────────────────────────────────────────
  const addMenuItem = useCallback(async (item: Omit<MenuItem, "id" | "created_at" | "updated_at">) => {
    const normalizedSection = item.section.trim() || 'Mains';
    await apiFetch('/api/menu', {
      method: 'POST',
      body: JSON.stringify({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category === 'veg' ? 'Veg' : 'Non-Veg',
        section: normalizedSection,
        sectionIcon: item.sectionIcon || '',
        imageURL: item.image,
        inStock: item.is_available !== false,
      }),
    });
    await refreshMenu();
  }, [refreshMenu]);

  const updateMenuItem = useCallback(async (item: MenuItem) => {
    const normalizedSection = item.section.trim() || 'Mains';
    await apiFetch(`/api/menu/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category === 'veg' ? 'Veg' : 'Non-Veg',
        section: normalizedSection,
        sectionIcon: item.sectionIcon || '',
        imageURL: item.image,
        inStock: item.is_available ?? item.inStock,
      }),
    });
    await refreshMenu();
  }, [refreshMenu]);

  const deleteMenuItem = useCallback(async (id: string) => {
    await apiFetch(`/api/menu/${id}`, { method: 'DELETE' });
    await refreshMenu();
  }, [refreshMenu]);

  // ── Derived state ─────────────────────────────────────────────────────────────
  const filteredItems = menuItems.filter(item => {
    if (foodFilter !== "all" && item.category !== foodFilter) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        user, authLoading, cart, menuItems, orders, favorites, loyaltyMap,
        foodFilter, searchQuery, showAuthModal, isAdminView,
        sendOtp, verifyOtp, logout, setUsername,
        addToCart, removeFromCart, updateCartQuantity, clearCart,
        toggleFavorite, setFoodFilter, setSearchQuery, setShowAuthModal, setIsAdminView,
        placeOrder, updateOrderStatus,
        addMenuItem, updateMenuItem, deleteMenuItem,
        refreshOrders, refreshMenu,
        filteredItems, cartTotal, cartCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
