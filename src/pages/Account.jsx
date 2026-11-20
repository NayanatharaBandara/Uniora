
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  UserRound,
  ShoppingBag,
  Package,
  CheckCircle,
  LogOut,
  RefreshCw,
  Store,
  MapPin,
  Phone,
  Download,
  FlaskConical,
  Receipt,
  XCircle,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "../styles/account.css";

function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async (currentUser) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, full_name, email, phone, role")
          .eq("id", currentUser.id)
          .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      let orderQuery = supabase
        .from("orders")
        .select(
          "id, buyer_id, seller_id, total_amount, status, created_at, delivery_name, delivery_phone, delivery_address, payment_method, payment_status, sandbox_status, checkout_reference"
        )
        .order("created_at", { ascending: false });

      if (profileData.role === "seller") {
        orderQuery = orderQuery.eq("seller_id", currentUser.id);
      } else {
        orderQuery = orderQuery.eq("buyer_id", currentUser.id);
      }

      const { data: orderData, error: orderError } =
        await orderQuery;

      if (orderError) throw orderError;

      setOrders(orderData || []);

      const orderIds = (orderData || []).map((order) => order.id);

      if (orderIds.length === 0) {
        setOrderItems({});
        setProducts({});
        return;
      }

      const { data: itemData, error: itemError } =
        await supabase
          .from("order_items")
          .select("id, order_id, product_id, quantity, unit_price")
          .in("order_id", orderIds);

      if (itemError) throw itemError;

      const productIds = [
        ...new Set((itemData || []).map((item) => item.product_id)),
      ];

      let productMap = {};

      if (productIds.length > 0) {
        const { data: productData, error: productError } =
          await supabase
            .from("products")
            .select("id, name, image_url")
            .in("id", productIds);

        if (productError) throw productError;

        productMap = Object.fromEntries(
          (productData || []).map((product) => [
            product.id,
            product,
          ])
        );
      }

      const groupedItems = {};

      (itemData || []).forEach((item) => {
        if (!groupedItems[item.order_id]) {
          groupedItems[item.order_id] = [];
        }

        groupedItems[item.order_id].push(item);
      });

      setOrderItems(groupedItems);
      setProducts(productMap);
    } catch (error) {
      console.error("Account dashboard error:", error);

      setErrorMessage(
        error.message || "Unable to load your account."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initializeAccount() {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);
      await loadDashboard(currentUser);
    }

    initializeAccount();

    return () => {
      active = false;
    };
  }, [navigate, loadDashboard]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/");
  }

  async function updateOrderStatus(orderId, newStatus) {
    setUpdatingOrder(orderId);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      if (user) {
        await loadDashboard(user);
      }
    } catch (error) {
      console.error("Order status update error:", error);

      setErrorMessage(
        error.message || "Unable to update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  // Escape values before inserting them into receipt HTML
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };

      return entities[character];
    });
  }

  // GROUP SANDBOX ORDERS BY CHECKOUT
  const sandboxTransactions = Object.values(
    orders
      .filter(
        (order) => order.payment_method === "Sandbox Payment"
      )
      .reduce((groups, order) => {
        const reference =
          order.checkout_reference || `order-${order.id}`;

        if (!groups[reference]) {
          groups[reference] = {
            reference,
            orders: [],
            items: [],
            total: 0,
            created_at: order.created_at,
            sandbox_status: order.sandbox_status || "not_started",
          };
        }

        groups[reference].orders.push(order);
        groups[reference].total += Number(order.total_amount || 0);

        (orderItems[order.id] || []).forEach((item) => {
          groups[reference].items.push(item);
        });

        return groups;
      }, {})
  ).sort(
    (a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
  );

  // DOWNLOAD RECEIPT AGAIN FROM ORDER HISTORY
  function downloadSandboxReceipt(transaction) {
    if (transaction.sandbox_status !== "success") {
      return;
    }

    const firstOrder = transaction.orders[0];

    const itemRows = transaction.items
      .map((item) => {
        const product = products[item.product_id];

        const productName =
          product?.name || `Product #${item.product_id}`;

        const itemTotal =
          Number(item.unit_price) * Number(item.quantity);

        return `
          <tr>
            <td>${escapeHtml(productName)}</td>
            <td>${Number(item.quantity)}</td>
            <td>
              LKR ${itemTotal.toLocaleString("en-LK")}
            </td>
          </tr>
        `;
      })
      .join("");

    const orderIds = transaction.orders
      .map((order) => order.id)
      .join(", ");

    const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UNIORA Payment Receipt</title>

<style>
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #f8f6fa;
  color: #38234f;
  padding: 30px 15px;
  margin: 0;
}

.receipt {
  max-width: 700px;
  margin: 20px auto;
  background: white;
  padding: 40px;
  border-radius: 14px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  color: #6d42a8;
  font-size: 34px;
  font-weight: bold;
  letter-spacing: 2px;
}

.notice {
  background: #f3edfa;
  color: #6d42a8;
  padding: 13px;
  border-radius: 8px;
  font-weight: bold;
}

.section {
  margin-top: 30px;
}

.section h3 {
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.details p {
  line-height: 1.7;
  overflow-wrap: anywhere;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 18px;
}

th, td {
  padding: 13px 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

th {
  background: #f8f5fb;
}

.total {
  text-align: right;
  font-size: 21px;
  font-weight: bold;
  margin-top: 25px;
  color: #6d42a8;
}

.payment-info {
  background: #f8f5fb;
  padding: 18px;
  border-radius: 9px;
  margin-top: 25px;
  line-height: 1.8;
}

.success {
  color: #24965b;
  font-weight: bold;
}

.footer {
  margin-top: 35px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #888;
  font-size: 13px;
  line-height: 1.7;
}
</style>
</head>

<body>
<div class="receipt">

  <div class="header">
    <div class="logo">UNIORA</div>
    <h2>Payment Receipt</h2>

    <div class="notice">
      SANDBOX MODE - TEST TRANSACTION ONLY
    </div>
  </div>

  <div class="section details">
    <h3>Transaction Information</h3>

    <p><strong>Checkout Reference:</strong>
    ${escapeHtml(transaction.reference)}</p>

    <p><strong>Order IDs:</strong>
    ${escapeHtml(orderIds)}</p>

    <p><strong>Date:</strong>
    ${escapeHtml(
      new Date(transaction.created_at).toLocaleString("en-LK")
    )}</p>
  </div>

  <div class="section details">
    <h3>Customer Information</h3>

    <p><strong>Name:</strong>
    ${escapeHtml(firstOrder.delivery_name)}</p>

    <p><strong>Phone:</strong>
    ${escapeHtml(firstOrder.delivery_phone)}</p>

    <p><strong>Address:</strong>
    ${escapeHtml(firstOrder.delivery_address)}</p>
  </div>

  <div class="section">
    <h3>Purchased Products</h3>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Amount</th>
        </tr>
      </thead>

      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <div class="total">
    Total Amount: LKR ${transaction.total.toLocaleString("en-LK")}
  </div>

  <div class="payment-info">
    <strong>Payment Method:</strong> Sandbox Payment<br>
    <strong>Payment Status:</strong>
    <span class="success">Successful (Test Only)</span>
  </div>

  <div class="footer">
    <strong>Thank you for shopping with UNIORA!</strong>
    <br>
    This is a simulated transaction receipt.
    <br>
    No real payment has been made.
  </div>

</div>
</body>
</html>
    `;

    const blob = new Blob([receiptHTML], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `UNIORA-Receipt-${transaction.reference}.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (loading) {
    return (
      <div className="account-message">
        Loading your UNIORA account...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="account-message">
        <h2>Unable to load your account</h2>
        <p>{errorMessage}</p>

        <button onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  const isSeller = profile.role === "seller";

  const totalAmount = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  const completedOrders = orders.filter(
    (order) => order.status?.toLowerCase() === "completed"
  ).length;

  return (
    <div className="account-page">

      {/* DASHBOARD HEADER */}

      <div className="account-header">
        <div>
          <span className="account-eyebrow">
            UNIORA ACCOUNT
          </span>

          <h1>
            Welcome, {profile.full_name || "Student"}!
          </h1>

          <p>
            {isSeller
              ? "Manage your shop and customer orders."
              : "Manage your profile and keep track of your purchases."}
          </p>
        </div>

        <button
          className="account-logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>

      {errorMessage && (
        <div className="account-error">
          {errorMessage}
        </div>
      )}

      {/* PROFILE CARD */}

      <section className="account-profile">
        <div className="account-avatar">
          <UserRound size={32} />
        </div>

        <div className="account-profile-info">
          <h2>{profile.full_name}</h2>
          <p>{profile.email}</p>

          <span className="account-role">
            {isSeller ? (
              <>
                <Store size={14} /> Seller Account
              </>
            ) : (
              <>
                <UserRound size={14} /> Student Account
              </>
            )}
          </span>
        </div>
      </section>

      {/* DASHBOARD STATISTICS */}

      <section className="account-stats">

        <div className="account-stat-card">
          <ShoppingBag size={23} />
          <div>
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        <div className="account-stat-card">
          <CheckCircle size={23} />
          <div>
            <span>Completed Orders</span>
            <strong>{completedOrders}</strong>
          </div>
        </div>

        <div className="account-stat-card">
          <Package size={23} />
          <div>
            <span>{isSeller ? "Order Value" : "Total Spent"}</span>
            <strong>
              LKR {totalAmount.toLocaleString("en-LK")}
            </strong>
          </div>
        </div>

      </section>

      {/* SANDBOX TRANSACTION HISTORY */}

      {!isSeller && (
        <section className="account-orders">

          <div className="account-section-heading">
            <div>
              <h2>
                <FlaskConical
                  size={21}
                  style={{
                    verticalAlign: "middle",
                    marginRight: "8px",
                    color: "#8051b5",
                  }}
                />
                Sandbox Transaction History
              </h2>

              <p>
                View your simulated payment transactions and download receipts.
              </p>
            </div>
          </div>

          {sandboxTransactions.length === 0 ? (
            <div className="account-empty">
              <FlaskConical size={42} />

              <h3>No Sandbox Transactions Yet</h3>

              <p>
                Your test payment transactions will appear here
                after you use Sandbox Payment at checkout.
              </p>
            </div>
          ) : (
            <div className="account-order-list">

              {sandboxTransactions.map((transaction) => {
                const status = transaction.sandbox_status;

                const statusColor =
                  status === "success"
                    ? "#24965b"
                    : status === "failed"
                      ? "#c94b4b"
                      : status === "cancelled"
                        ? "#777"
                        : "#b07b24";

                const statusLabel =
                  status === "success"
                    ? "Successful"
                    : status === "failed"
                      ? "Failed"
                      : status === "cancelled"
                        ? "Cancelled"
                        : "Not Started";

                return (
                  <article
                    className="account-order-card"
                    key={transaction.reference}
                  >

                    <div className="account-order-top">
                      <div>
                        <span className="account-order-label">
                          SANDBOX TRANSACTION
                        </span>

                        <p>
                          {new Date(
                            transaction.created_at
                          ).toLocaleString("en-LK")}
                        </p>
                      </div>

                      <span
                        style={{
                          color: statusColor,
                          background: `${statusColor}15`,
                          padding: "7px 12px",
                          borderRadius: "20px",
                          fontWeight: "600",
                          fontSize: "13px",
                        }}
                      >
                        {status === "success" ? (
                          <CheckCircle
                            size={14}
                            style={{
                              verticalAlign: "middle",
                              marginRight: "5px",
                            }}
                          />
                        ) : status === "failed" ||
                          status === "cancelled" ? (
                          <XCircle
                            size={14}
                            style={{
                              verticalAlign: "middle",
                              marginRight: "5px",
                            }}
                          />
                        ) : null}

                        {statusLabel}
                      </span>
                    </div>

                    <div
                      style={{
                        background: "#f8f5fb",
                        borderRadius: "10px",
                        padding: "15px",
                        marginTop: "15px",
                      }}
                    >
                      <p style={{ margin: "0 0 8px" }}>
                        <strong>Checkout Reference:</strong>
                      </p>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {transaction.reference}
                      </p>

                      <p style={{ margin: "12px 0 0" }}>
                        <strong>Order IDs:</strong>{" "}
                        {transaction.orders
                          .map((order) => order.id)
                          .join(", ")}
                      </p>
                    </div>

                    <div className="account-order-items">
                      {transaction.items.map((item) => {
                        const product = products[item.product_id];

                        return (
                          <div
                            className="account-order-item"
                            key={`${item.order_id}-${item.id}`}
                          >
                            {product?.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                              />
                            ) : (
                              <div className="account-item-placeholder">
                                <Package size={22} />
                              </div>
                            )}

                            <div className="account-item-info">
                              <strong>
                                {product?.name ||
                                  `Product #${item.product_id}`}
                              </strong>

                              <p>
                                Quantity: {item.quantity}
                              </p>
                            </div>

                            <strong>
                              LKR{" "}
                              {(
                                Number(item.unit_price) *
                                Number(item.quantity)
                              ).toLocaleString("en-LK")}
                            </strong>
                          </div>
                        );
                      })}
                    </div>

                    <div className="account-order-bottom">
                      <div>
                        <span>
                          Payment Method: Sandbox Payment
                        </span>

                        <span>
                          Actual Payment Status: Pending
                        </span>
                      </div>

                      <strong>
                        Total: LKR{" "}
                        {transaction.total.toLocaleString("en-LK")}
                      </strong>
                    </div>

                    {status === "success" && (
                      <button
                        type="button"
                        onClick={() =>
                          downloadSandboxReceipt(transaction)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          width: "100%",
                          marginTop: "15px",
                          padding: "12px",
                          border: "none",
                          borderRadius: "8px",
                          background: "#6d42a8",
                          color: "white",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        <Download size={17} />
                        Download Test Receipt
                      </button>
                    )}

                    {status !== "success" && (
                      <p
                        style={{
                          color: "#777",
                          fontSize: "13px",
                          marginTop: "15px",
                        }}
                      >
                        A receipt is available only for successful
                        simulated payments.
                      </p>
                    )}

                  </article>
                );
              })}

            </div>
          )}

        </section>
      )}

      {/* EXISTING ORDER HISTORY */}

      <section className="account-orders">

        <div className="account-section-heading">
          <div>
            <h2>
              {isSeller ? "Incoming Orders" : "My Orders"}
            </h2>

            <p>
              {isSeller
                ? "Orders placed with your shop."
                : "Your recent purchases on UNIORA."}
            </p>
          </div>

          <button
            className="account-refresh"
            onClick={() => user && loadDashboard(user)}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="account-empty">
            <ShoppingBag size={42} />
            <h3>No orders yet</h3>

            <p>
              {isSeller
                ? "New customer orders will appear here."
                : "Your purchases will appear here after you place an order."}
            </p>

            {!isSeller && (
              <button onClick={() => navigate("/marketplace")}>
                Explore Marketplace
              </button>
            )}
          </div>
        ) : (
          <div className="account-order-list">

            {orders.map((order) => (
              <article
                className="account-order-card"
                key={order.id}
              >

                <div className="account-order-top">
                  <div>
                    <span className="account-order-label">
                      ORDER #{order.id}
                    </span>

                    <p>
                      {new Date(order.created_at).toLocaleString(
                        "en-LK"
                      )}
                    </p>
                  </div>

                  <span
                    className={`order-status status-${order.status?.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="account-order-items">
                  {(orderItems[order.id] || []).map((item) => {
                    const product = products[item.product_id];

                    return (
                      <div
                        className="account-order-item"
                        key={item.id}
                      >
                        {product?.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                          />
                        ) : (
                          <div className="account-item-placeholder">
                            <Package size={22} />
                          </div>
                        )}

                        <div className="account-item-info">
                          <strong>
                            {product?.name ||
                              `Product #${item.product_id}`}
                          </strong>

                          <p>
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        <strong>
                          LKR{" "}
                          {(
                            Number(item.unit_price) *
                            Number(item.quantity)
                          ).toLocaleString("en-LK")}
                        </strong>
                      </div>
                    );
                  })}
                </div>

                {isSeller && (
                  <div className="account-customer-details">
                    <h4>Customer & Delivery Details</h4>

                    <p>
                      <UserRound size={15} />
                      {order.delivery_name}
                    </p>

                    <p>
                      <Phone size={15} />
                      {order.delivery_phone}
                    </p>

                    <p>
                      <MapPin size={15} />
                      {order.delivery_address}
                    </p>
                  </div>
                )}

                <div className="account-order-bottom">
                  <div>
                    <span>
                      Payment: {order.payment_method}
                    </span>

                    <span>
                      Payment status: {order.payment_status || "Pending"}
                    </span>

                    {order.payment_method === "Sandbox Payment" && (
                      <span>
                        Sandbox status: {order.sandbox_status || "not_started"}
                      </span>
                    )}
                  </div>

                  <strong>
                    Total: LKR{" "}
                    {Number(order.total_amount).toLocaleString("en-LK")}
                  </strong>
                </div>

                {isSeller && (
                  <div className="account-status-control">
                    <label htmlFor={`status-${order.id}`}>
                      Update Order Status
                    </label>

                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      disabled={
                        updatingOrder === order.id ||
                        ["completed", "cancelled"].includes(
                          order.status?.toLowerCase()
                        )
                      }
                      onChange={(event) =>
                        updateOrderStatus(
                          order.id,
                          event.target.value
                        )
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {updatingOrder === order.id && (
                      <span>Updating...</span>
                    )}
                  </div>
                )}

              </article>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default Account;
