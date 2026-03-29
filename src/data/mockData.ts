export interface FoodItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "veg" | "nonveg";
  description: string;
  offers?: string;
}

export interface OrderItem {
  item: FoodItem;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "accepted" | "cooking" | "packing" | "ready" | "delivered" | "rejected";
  paymentMethod: "cash" | "online";
  prepTime?: number;
  whatsappCoupon: string;
  deliveryPin: string;
  createdAt: Date;
  customerName: string;
  customerPhone: string;
}

export const mockFoodItems: FoodItem[] = [
  {
    id: "1",
    name: "Butter Chicken",
    price: 220,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
    category: "nonveg",
    description: "Creamy tomato-based curry with tender chicken",
    offers: "10% off",
  },
  {
    id: "2",
    name: "Paneer Tikka Masala",
    price: 180,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop",
    category: "veg",
    description: "Grilled paneer in rich spiced gravy",
  },
  {
    id: "3",
    name: "Chicken Biryani",
    price: 250,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
    category: "nonveg",
    description: "Fragrant basmati rice with spiced chicken",
    offers: "Family pack available",
  },
  {
    id: "4",
    name: "Veg Biryani",
    price: 180,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop",
    category: "veg",
    description: "Aromatic basmati rice with mixed vegetables",
  },
  {
    id: "5",
    name: "Samosa (2 pcs)",
    price: 40,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
    category: "veg",
    description: "Crispy pastry filled with spiced potatoes",
  },
  {
    id: "6",
    name: "Chapathi (4 pcs)",
    price: 40,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    category: "veg",
    description: "Soft whole wheat flatbread",
  },
  {
    id: "7",
    name: "Chicken 65",
    price: 200,
    image: "https://images.unsplash.com/photo-1610057099443-fde6c99db7cd?w=400&h=300&fit=crop",
    category: "nonveg",
    description: "Spicy deep-fried chicken bites",
    offers: "Buy 2 Get 1",
  },
  {
    id: "8",
    name: "Dal Tadka",
    price: 120,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
    category: "veg",
    description: "Yellow lentils tempered with spices",
  },
  {
    id: "9",
    name: "Egg Curry",
    price: 130,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop",
    category: "nonveg",
    description: "Boiled eggs in tangy onion-tomato gravy",
  },
  {
    id: "10",
    name: "Gulab Jamun (4 pcs)",
    price: 80,
    image: "https://images.unsplash.com/photo-1666190493918-48591c00daea?w=400&h=300&fit=crop",
    category: "veg",
    description: "Soft milk dumplings soaked in sugar syrup",
  },
  {
    id: "11",
    name: "Chole Bhature",
    price: 140,
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&h=300&fit=crop",
    category: "veg",
    description: "Spiced chickpeas with fluffy fried bread",
  },
  {
    id: "12",
    name: "Fish Fry",
    price: 260,
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&h=300&fit=crop",
    category: "nonveg",
    description: "Crispy spiced fried fish fillets",
  },
];

export const generateOrderId = () => "ORD" + Math.random().toString(36).substring(2, 8).toUpperCase();
export const generateCoupon = () => Math.random().toString(36).substring(2, 8).toUpperCase();
export const generatePin = () => String(Math.floor(1000 + Math.random() * 9000));
