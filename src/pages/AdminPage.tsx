import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import AdminDashboard from "@/pages/AdminDashboard";

const AdminPage = () => {
  const { user, setShowAuthModal } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <ShieldAlert className="h-14 w-14 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold">Admin Login Required</h1>
        <p className="mt-1 text-sm text-muted-foreground">Please login with an admin mobile number.</p>
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

  if (!user.isAdmin) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <ShieldAlert className="h-14 w-14 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Access Denied</h1>
        <p className="mt-1 text-sm text-muted-foreground">This page is available only for admin users.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-lg border px-6 py-2 text-sm font-bold text-foreground"
        >
          <span className="inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back to Menu</span>
        </button>
      </div>
    );
  }

  return <AdminDashboard />;
};

export default AdminPage;
