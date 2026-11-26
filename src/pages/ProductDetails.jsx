
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Package
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { getProductDisplayImage } from "../utils/productImages";
import "../styles/productDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (error) {
        setError("Product not found or unavailable.");
        setProduct(null);
      } else {
        setProduct(data);

        if (data.category_id) {
          const { data: categoryData } = await supabase
            .from("categories")
            .select("name")
            .eq("id", data.category_id)
            .single();

          setCategory(categoryData?.name || "General");
        }
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // Add product to shopping cart
  function handleAddToCart() {
    if (!product || product.stock <= 0) return;

    const savedCart = JSON.parse(
      localStorage.getItem("uniora_cart") || "[]"
    );

    const existingItem = savedCart.find(
      (item) => String(item.id) === String(product.id)
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert("You have already added the maximum available stock.");
        return;
      }

      existingItem.quantity += 1;
    } else {
      savedCart.push({
        id: product.id,
        quantity: 1,
        image_url: getProductDisplayImage(product)
      });
    }

    localStorage.setItem(
      "uniora_cart",
      JSON.stringify(savedCart)
    );

    navigate("/cart");
  }

  if (loading) {
    return (
      <div className="product-message">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-message">
        <h2>{error || "Product not found"}</h2>

        <button onClick={() => navigate("/marketplace")}>
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">

      <button
        className="back-button"
        onClick={() => navigate("/marketplace")}
      >
        <ArrowLeft size={18} />
        Back to Marketplace
      </button>

      <div className="product-details-container">

        <div className="product-details-image">
          <img
            src={getProductDisplayImage(product)}
            alt={product.name}
          />
        </div>

        <div className="product-details-info">

          <span className="product-category">
            {category}
          </span>

          <h1>{product.name}</h1>

          <h2 className="product-price">
            Rs. {Number(product.price).toLocaleString("en-LK")}
          </h2>

          <p className="product-description">
            {product.description || "No description available."}
          </p>

          <div className="product-stock">
            <Package size={19} />

            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
          </div>

          <button
            className="add-cart-button"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart size={19} />

            {product.stock > 0
              ? "Add to Cart"
              : "Out of Stock"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
