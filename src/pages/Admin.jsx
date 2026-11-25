import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Users, Package, ShoppingBag, RefreshCw, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "../styles/admin.css";

function Admin() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setChecking(true);
    setError("");
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) { setAuthorized(false); setChecking(false); return; }

    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profileError || profile?.role !== "admin") {
      setAuthorized(false);
      setChecking(false);
      return;
    }
    setAuthorized(true);

    const [users, products, orders, latest] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id,total_amount,status,created_at,delivery_name").order("created_at", { ascending: false }).limit(8)
    ]);
    const firstError = users.error || products.error || orders.error || latest.error;
    if (firstError) setError(firstError.message);
    setStats({ users: users.count || 0, products: products.count || 0, orders: orders.count || 0 });
    setRecentOrders(latest.data || []);
    setChecking(false);
  }

  useEffect(() => { loadDashboard(); }, []);

  if (checking) return <div className="admin-state">Loading admin dashboard...</div>;
  if (!authorized) return <Navigate to="/login" replace />;

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div><span>UNIORA CONTROL CENTRE</span><h1><ShieldCheck size={27} /> Admin Dashboard</h1><p>Overview of your student marketplace.</p></div>
        <button onClick={loadDashboard}><RefreshCw size={16} /> Refresh</button>
      </header>
      {error && <p className="admin-error">{error}</p>}
      <section className="admin-stats">
        <article><Users /><span>Total users</span><strong>{stats.users}</strong></article>
        <article><Package /><span>Products</span><strong>{stats.products}</strong></article>
        <article><ShoppingBag /><span>Orders</span><strong>{stats.orders}</strong></article>
      </section>
      <section className="admin-orders">
        <h2>Recent orders</h2>
        {recentOrders.length ? <div className="admin-table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr></thead><tbody>
          {recentOrders.map(order => <tr key={order.id}><td>#{order.id}</td><td>{order.delivery_name || "—"}</td><td>{order.status || "—"}</td><td>LKR {Number(order.total_amount || 0).toLocaleString("en-LK")}</td><td>{new Date(order.created_at).toLocaleDateString("en-LK")}</td></tr>)}
        </tbody></table></div> : <p>No orders are available to display.</p>}
      </section>
    </div>
  );
}
export default Admin;
