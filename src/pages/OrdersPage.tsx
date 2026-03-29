import { ArrowLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import OrderTracker from "@/components/OrderTracker";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const { orders } = useApp();
  const navigate = useNavigate();
  const activeOrders = orders.filter((o) => !["delivered", "rejected"].includes(o.status));
  const pastOrders = orders.filter((o) => ["delivered", "rejected"].includes(o.status));

  return (
    <div className="container max-w-lg py-6">
      <button onClick={() => navigate("/")} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </button>
      <h1 className="mb-4 font-display text-2xl font-bold">My Orders</h1>

      {orders.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <p className="text-5xl">📦</p>
          <p className="mt-3 text-muted-foreground">No orders yet</p>
        </div>
      )}

      {activeOrders.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 font-display text-sm font-bold text-primary">Active Orders</h2>
          <div className="space-y-3">
            {activeOrders.map((order) => <OrderTracker key={order.id} order={order} />)}
          </div>
        </div>
      )}

      {pastOrders.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-sm font-bold text-muted-foreground">Past Orders</h2>
          <div className="space-y-3">
            {pastOrders.map((order) => <OrderTracker key={order.id} order={order} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
