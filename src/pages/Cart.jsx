
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { getProductDisplayImage } from "../utils/productImages";
import "../styles/cart.css";

function Cart() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    const savedCart = JSON.parse(
      localStorage.getItem("uniora_cart") || "[]"
    );

    if (!savedCart.length) {
      setItems([]);
      setLoading(false);
      return;
    }

    const ids = savedCart.map((item) => item.id);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("status", "active");

    if (error) {
      console.error(error);
      setItems([]);
    } else {
      const cartItems = data.map((product) => {
        const savedItem = savedCart.find(
          (item) => String(item.id) === String(product.id)
        );

        return {
          ...product,
          image_url: getProductDisplayImage(product),
          quantity: savedItem?.quantity || 1
        };
      });

      setItems(cartItems);
      saveCart(cartItems);
    }

    setLoading(false);
  }

  function saveCart(updatedItems) {
    localStorage.setItem(
      "uniora_cart",
      JSON.stringify(
        updatedItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          image_url: getProductDisplayImage(item)
        }))
      )
    );
  }

  function updateQuantity(id, change) {
    const updatedItems = items
      .map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: Math.min(
              item.stock,
              item.quantity + change
            )
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    setItems(updatedItems);
    saveCart(updatedItems);
  }

  function removeItem(id) {
    const updatedItems = items.filter(
      (item) => item.id !== id
    );

    setItems(updatedItems);
    saveCart(updatedItems);
  }

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="cart-message">
        Loading your cart...
      </div>
    );
  }

  return (
    <div className="cart-page">

      <div className="cart-heading">
        <ShoppingBag size={30} />
        <h1>My Shopping Cart</h1>
        <p>Your selected products in one place.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <ShoppingBag size={55} />

          <h2>Your cart is empty</h2>

          <p>
            Discover something useful for your university life.
          </p>

          <Link to="/marketplace">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="cart-layout">

          <div className="cart-items">

            {items.map((item) => (
              <div className="cart-item" key={item.id}>

                <img
                  src={
                    item.image_url ||
                    "https://placehold.co/150x150?text=UNIORA"
                  }
                  alt={item.name}
                />

                <div className="cart-item-info">
                  <h3>{item.name}</h3>

                  <p>
                    LKR {Number(item.price).toLocaleString("en-LK")}
                  </p>

                  <div className="quantity-controls">

                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus size={15} />
                    </button>

                  </div>
                </div>

                <div className="cart-item-actions">

                  <strong>
                    LKR{" "}
                    {(Number(item.price) * item.quantity)
                      .toLocaleString("en-LK")}
                  </strong>

                  <button
                    className="remove-cart-item"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={19} />
                  </button>

                </div>
              </div>
            ))}

          </div>

          <div className="cart-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Total Items</span>

              <span>
                {items.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}
              </span>
            </div>

            <div className="summary-row cart-total">
              <strong>Total Amount</strong>

              <strong>
                LKR {total.toLocaleString("en-LK")}
              </strong>
            </div>

            <button
              className="checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>

            <Link
              to="/marketplace"
              className="continue-shopping"
            >
              Continue Shopping
            </Link>

          </div>
        </div>
      )}

    </div>
  );
}

export default Cart;
