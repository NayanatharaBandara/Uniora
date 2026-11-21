
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import {
  MapPin,
  Phone,
  User,
  ShoppingBag,
  CheckCircle,
  Package,
  CreditCard,
  Receipt,
  XCircle,
} from "lucide-react";

import "../styles/checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentUpdating, setPaymentUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderResult, setOrderResult] = useState(null);
  const [sandboxStatus, setSandboxStatus] = useState("not_started");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "Cash on Delivery",
  });

  useEffect(() => {
    async function loadCart() {
      try {
        const savedCart = JSON.parse(
          localStorage.getItem("uniora_cart") || "[]"
        );

        if (!savedCart.length) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .in("id", savedCart.map((item) => item.id))
          .eq("status", "active");

        if (error) throw error;

        const updatedCart = data.map((product) => ({
          ...product,
          quantity:
            savedCart.find(
              (item) => String(item.id) === String(product.id)
            )?.quantity || 1,
        }));

        setCartItems(updatedCart);
      } catch (error) {
        console.error("Cart loading error:", error);
        setErrorMessage("Unable to load your shopping cart.");
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  const total = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setErrorMessage("");
  }

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

  // SAVE SANDBOX RESULT TO SUPABASE
  async function handleSandboxResult(status) {
    if (!orderResult || paymentUpdating) return;

    setPaymentUpdating(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "set_uniora_sandbox_payment_result",
        {
          p_checkout_reference: orderResult.checkout_reference,
          p_status: status,
        }
      );

      if (error) throw error;

      if (!data || data.success !== true) {
        throw new Error("Unable to update sandbox payment.");
      }

      setSandboxStatus(status);

    } catch (error) {
      console.error("Sandbox payment update error:", error);

      setErrorMessage(
        error.message || "Unable to save the test payment result."
      );
    } finally {
      setPaymentUpdating(false);
    }
  }

  // DOWNLOAD TEST RECEIPT
  function downloadTestReceipt() {
    if (!orderResult || sandboxStatus !== "success") return;

    const items = orderResult.receiptItems || [];
    const receiptTotal = Number(orderResult.receiptTotal || 0);

    const itemRows = items.map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${Number(item.quantity)}</td>
        <td>
          LKR ${(
            Number(item.price) * Number(item.quantity)
          ).toLocaleString("en-LK")}
        </td>
      </tr>
    `).join("");

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
  box-shadow: 0 5px 25px rgba(0,0,0,0.06);
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
  font-size: 13px;
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

@media(max-width:500px) {
  .receipt {
    padding: 22px;
  }

  th, td {
    padding: 9px 5px;
    font-size: 12px;
  }
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
    ${escapeHtml(orderResult.checkout_reference)}</p>

    <p><strong>Order IDs:</strong>
    ${escapeHtml(orderResult.order_ids?.join(", "))}</p>

    <p><strong>Date:</strong>
    ${escapeHtml(orderResult.receiptDate)}</p>
  </div>

  <div class="section details">
    <h3>Customer Information</h3>

    <p><strong>Name:</strong> ${escapeHtml(form.fullName)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(form.phone)}</p>
    <p><strong>Delivery Address:</strong> ${escapeHtml(form.address)}</p>
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
    Total Amount: LKR ${receiptTotal.toLocaleString("en-LK")}
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
    link.download =
      `UNIORA-Receipt-${orderResult.checkout_reference}.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/login");
        return;
      }

      if (!cartItems.length) {
        setErrorMessage("Your shopping cart is empty.");
        return;
      }

      const orderItems = cartItems.map((item) => ({
        id: Number(item.id),
        quantity: Number(item.quantity),
      }));

      const { data, error } = await supabase.rpc(
        "place_uniora_order",
        {
          p_items: orderItems,
          p_delivery_name: form.fullName.trim(),
          p_delivery_phone: form.phone.trim(),
          p_delivery_address: form.address.trim(),
          p_payment_method: form.paymentMethod,
        }
      );

      if (error) throw error;

      if (!data || data.success !== true) {
        throw new Error(
          data?.message || "Unable to complete your order."
        );
      }

      const receiptItems = cartItems.map((item) => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      const receiptTotal = total;
      const receiptDate = new Date().toLocaleString("en-LK");

      localStorage.removeItem("uniora_cart");
      setCartItems([]);

      setOrderResult({
        ...data,
        receiptItems,
        receiptTotal,
        receiptDate,
      });

      setSandboxStatus("not_started");

    } catch (error) {
      console.error("Order submission error:", error);

      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="checkout-message">
        Loading checkout...
      </div>
    );
  }

  // ORDER CONFIRMATION
  if (orderResult) {
    const isSandbox =
      form.paymentMethod === "Sandbox Payment";

    return (
      <div className="checkout-page">
        <div className="checkout-success">

          {isSandbox ? (
            <>
              <CreditCard size={55} color="#6d42a8" />

              <h1>Sandbox Payment</h1>

              <p>
                This is a test transaction.
                No real money will be charged.
              </p>

              <div className="success-details">
                <Package size={22} />

                <div>
                  <strong>Checkout Reference</strong>
                  <p>{orderResult.checkout_reference}</p>
                </div>
              </div>

              <div className="success-details">
                <ShoppingBag size={22} />

                <div>
                  <strong>Order IDs</strong>
                  <p>{orderResult.order_ids?.join(", ")}</p>
                </div>
              </div>

              <div
                style={{
                  background: "#f5f0fa",
                  padding: "20px",
                  borderRadius: "12px",
                  margin: "20px 0",
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  Test Payment Amount
                </h3>

                <h2 style={{ color: "#6d42a8" }}>
                  LKR {Number(
                    orderResult.receiptTotal
                  ).toLocaleString("en-LK")}
                </h2>

                <p>
                  Choose a result to simulate the payment.
                </p>

                {sandboxStatus === "not_started" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      disabled={paymentUpdating}
                      onClick={() => handleSandboxResult("success")}
                      style={{
                        padding: "13px",
                        background: "#6d42a8",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <CheckCircle
                        size={17}
                        style={{
                          verticalAlign: "middle",
                          marginRight: "7px",
                        }}
                      />
                      {paymentUpdating
                        ? "Updating..."
                        : "Simulate Successful Payment"}
                    </button>

                    <button
                      type="button"
                      disabled={paymentUpdating}
                      onClick={() => handleSandboxResult("failed")}
                      style={{
                        padding: "13px",
                        background: "#c94b4b",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <XCircle
                        size={17}
                        style={{
                          verticalAlign: "middle",
                          marginRight: "7px",
                        }}
                      />
                      Simulate Failed Payment
                    </button>

                    <button
                      type="button"
                      disabled={paymentUpdating}
                      onClick={() => handleSandboxResult("cancelled")}
                      style={{
                        padding: "13px",
                        background: "#777",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel Test Payment
                    </button>
                  </div>
                )}

                {sandboxStatus === "success" && (
                  <div>
                    <CheckCircle
                      size={45}
                      color="#24965b"
                    />

                    <h3 style={{ color: "#24965b" }}>
                      Test Payment Successful!
                    </h3>

                    <p>
                      Your simulated payment was successfully saved.
                    </p>

                    <p>
                      <strong>Sandbox Status:</strong> Success
                    </p>

                    <p>
                      <strong>Actual Payment Status:</strong> Pending
                    </p>

                    <button
                      type="button"
                      onClick={downloadTestReceipt}
                      style={{
                        padding: "13px 20px",
                        background: "#6d42a8",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <Receipt
                        size={17}
                        style={{
                          verticalAlign: "middle",
                          marginRight: "7px",
                        }}
                      />
                      Download Test Receipt
                    </button>
                  </div>
                )}

                {sandboxStatus === "failed" && (
                  <div>
                    <XCircle size={45} color="#c94b4b" />

                    <h3 style={{ color: "#c94b4b" }}>
                      Test Payment Failed
                    </h3>

                    <p>
                      Failed test result saved successfully.
                    </p>

                    <button
                      type="button"
                      onClick={() => handleSandboxResult("success")}
                      disabled={paymentUpdating}
                      className="place-order-button"
                    >
                      Try Successful Payment
                    </button>
                  </div>
                )}

                {sandboxStatus === "cancelled" && (
                  <div>
                    <XCircle size={45} color="#777" />

                    <h3>Test Payment Cancelled</h3>

                    <p>
                      Cancelled test result saved successfully.
                    </p>

                    <button
                      type="button"
                      onClick={() => handleSandboxResult("success")}
                      disabled={paymentUpdating}
                      className="place-order-button"
                    >
                      Try Successful Payment
                    </button>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="checkout-error">
                  {errorMessage}
                </div>
              )}

              <p className="payment-note">
                SANDBOX MODE – TEST TRANSACTION ONLY
              </p>
            </>
          ) : (
            <>
              <CheckCircle size={65} color="#6d42a8" />

              <h1>Order Placed Successfully!</h1>

              <p>
                Thank you for shopping with UNIORA.
                Your order has been received.
              </p>

              <div className="success-details">
                <Package size={22} />

                <div>
                  <strong>Checkout Reference</strong>
                  <p>{orderResult.checkout_reference}</p>
                </div>
              </div>

              <div className="success-details">
                <ShoppingBag size={22} />

                <div>
                  <strong>Order IDs</strong>
                  <p>{orderResult.order_ids?.join(", ")}</p>
                </div>
              </div>

              <p className="payment-note">
                Payment method: {form.paymentMethod}
                <br />
                Payment status: Pending
              </p>
            </>
          )}

          <button
            className="place-order-button"
            onClick={() => navigate("/marketplace")}
          >
            Continue Shopping
          </button>

          <button
            className="continue-home-button"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>

        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-message">
        <h2>Your cart is empty</h2>

        <button onClick={() => navigate("/marketplace")}>
          Explore Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      <div className="checkout-heading">
        <ShoppingBag size={32} />

        <h1>Checkout</h1>

        <p>
          Complete your information to continue your order.
        </p>
      </div>

      <div className="checkout-layout">

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >

          <h2>Delivery Information</h2>

          <label>
            <User size={17} />
            Full Name
          </label>

          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <label>
            <Phone size={17} />
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <label>
            <MapPin size={17} />
            Delivery Address
          </label>

          <textarea
            name="address"
            placeholder="Enter your complete delivery address"
            value={form.address}
            onChange={handleChange}
            required
          />

          <h2>Payment Method</h2>

          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="Cash on Delivery">
              Cash on Delivery
            </option>

            <option value="Bank Transfer">
              Bank Transfer
            </option>

            <option value="Sandbox Payment">
              Sandbox Payment (Test Only)
            </option>
          </select>

          {form.paymentMethod === "Sandbox Payment" && (
            <div
              style={{
                background: "#f5f0fa",
                padding: "12px",
                borderRadius: "8px",
                marginTop: "12px",
              }}
            >
              <strong>Sandbox Test Mode</strong>

              <p style={{ marginBottom: 0 }}>
                Test successful, failed and cancelled payments
                without using real money.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="checkout-error">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="place-order-button"
            disabled={submitting}
          >
            {submitting
              ? "Placing Your Order..."
              : form.paymentMethod === "Sandbox Payment"
                ? "Continue to Test Payment"
                : "Place Order"}
          </button>

        </form>

        <div className="checkout-summary">

          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div
              className="checkout-product"
              key={item.id}
            >
              <div>
                <strong>{item.name}</strong>

                <p>
                  Quantity: {item.quantity}
                </p>
              </div>

              <span>
                LKR{" "}
                {(
                  Number(item.price) * item.quantity
                ).toLocaleString("en-LK")}
              </span>
            </div>
          ))}

          <div className="checkout-total">
            <strong>Total Amount</strong>

            <strong>
              LKR {total.toLocaleString("en-LK")}
            </strong>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Checkout;
