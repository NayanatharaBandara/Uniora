
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Package,
  Trash2,
  X,
  ImagePlus,
  LoaderCircle,
  Store
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "../styles/sellerProducts.css";

const categories = [
  { id: 1, name: "Stationery" },
  { id: 2, name: "Electronics" },
  { id: 3, name: "Bags" },
  { id: 4, name: "Books" },
  { id: 5, name: "Other Products" }
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category_id: "1",
  stock: "1",
  image_url: ""
};

function SellerProducts() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    setLoading(true);

    const {
      data: { user: currentUser },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      setError("Please log in to manage your products.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (profileError || profile?.role !== "seller") {
      setError("This page is only available to seller accounts.");
      setLoading(false);
      return;
    }

    setUser(currentUser);
    await loadProducts(currentUser.id);

    setLoading(false);
  }

  async function loadProducts(sellerId) {
    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setProducts(data || []);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  function handleImageChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError("");
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setImage(null);
    setPreview("");
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category_id: String(product.category_id || "1"),
      stock: String(product.stock ?? "1"),
      image_url: product.image_url || ""
    });

    setImage(null);
    setPreview(product.image_url || "");
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function uploadProductImage() {
    if (!image) return form.image_url;

    const fileExtension = image.name.split(".").pop();

    const filePath =
      `${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, image, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      setError("Please log in again.");
      return;
    }

    if (!form.name.trim() || !form.price || !form.stock) {
      setError("Please complete all required fields.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number of zero or more.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const imageUrl = await uploadProductImage();

      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        category_id: Number(form.category_id),
        stock,
        image_url: imageUrl || null,
        seller_id: user.id
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId)
          .eq("seller_id", user.id);
      } else {
        result = await supabase
          .from("products")
          .insert({
            ...productData,
            status: "active"
          });
      }

      if (result.error) {
        throw result.error;
      }

      setSuccess(
        editingId
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      setShowForm(false);
      setForm(emptyForm);
      setImage(null);
      setPreview("");
      setEditingId(null);

      await loadProducts(user.id);

    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  // DELETE PRODUCT FROM MARKETPLACE
  // Keeps the database record for existing order history.
  async function removeProduct(product) {
    if (!user) {
      setError("Please log in again.");
      return;
    }

    const confirmed = window.confirm(
      `Remove "${product.name}" from the marketplace?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    const { data, error: updateError } = await supabase
      .from("products")
      .update({ status: "inactive" })
      .eq("id", product.id)
      .eq("seller_id", user.id)
      .select("id");

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (!data || data.length === 0) {
      setError("Unable to remove this product. Please check your permissions.");
      return;
    }

    setSuccess("Product removed from the marketplace.");
    await loadProducts(user.id);
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setImage(null);
    setPreview("");
    setEditingId(null);
    setError("");
  }

  const activeProducts = products.filter(
    (product) => product.status === "active"
  );

  if (loading) {
    return (
      <div className="seller-products-message">
        <LoaderCircle className="seller-spinner" size={30} />
        <p>Loading your products...</p>
      </div>
    );
  }

  if (!user || (error && !products.length && !showForm)) {
    return (
      <div className="seller-products-message">
        <Store size={40} />
        <h2>Seller access required</h2>
        <p>{error || "Please log in with a seller account."}</p>
      </div>
    );
  }

  return (
    <div className="seller-products-page">

      {/* PAGE HEADER */}
      <div className="seller-products-header">
        <div>
          <span className="seller-eyebrow">SELLER DASHBOARD</span>
          <h1>My Products</h1>
          <p>Manage your products, prices and stock in one place.</p>
        </div>

        <button
          className="add-product-button"
          onClick={openAddForm}
        >
          <Plus size={19} />
          Add Product
        </button>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="seller-alert seller-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="seller-alert seller-alert-success">
          {success}
        </div>
      )}

      {/* STATISTICS */}
      <div className="seller-product-stats">
        <div className="seller-stat-card">
          <Package size={25} />
          <div>
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </div>
        </div>

        <div className="seller-stat-card">
          <Store size={25} />
          <div>
            <span>Active Products</span>
            <strong>{activeProducts.length}</strong>
          </div>
        </div>

        <div className="seller-stat-card">
          <Package size={25} />
          <div>
            <span>Inactive Products</span>
            <strong>{products.length - activeProducts.length}</strong>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="seller-form-overlay">
          <form
            className="seller-product-form"
            onSubmit={handleSubmit}
          >
            <div className="seller-form-heading">
              <div>
                <span className="seller-eyebrow">
                  PRODUCT MANAGEMENT
                </span>
                <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
              </div>

              <button
                type="button"
                className="seller-close-button"
                onClick={closeForm}
              >
                <X />
              </button>
            </div>

            <div className="seller-form-grid">

              <div className="seller-field">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="seller-field">
                <label>Category *</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="seller-field">
                <label>Price (LKR) *</label>
                <input
                  type="number"
                  name="price"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="seller-field">
                <label>Available Stock *</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  placeholder="Enter stock quantity"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="seller-field seller-field-full">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe your product..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="seller-field seller-field-full">
                <label>Product Image</label>

                <label className="seller-image-upload">
                  {preview ? (
                    <img src={preview} alt="Product preview" />
                  ) : (
                    <>
                      <ImagePlus size={35} />
                      <strong>Choose a product image</strong>
                      <span>JPG, PNG or WEBP. Maximum 5 MB.</span>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              </div>
            </div>

            <div className="seller-form-actions">
              <button
                type="button"
                className="seller-cancel-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="seller-save-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle size={17} className="seller-spinner" />
                    Saving...
                  </>
                ) : (
                  editingId ? "Save Changes" : "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCT LIST */}
      <div className="seller-product-list-heading">
        <div>
          <h2>Your Listings</h2>
          <p>Products added by your shop.</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="seller-empty-state">
          <Package size={45} />
          <h3>No products yet</h3>
          <p>Add your first product to start selling on UNIORA.</p>

          <button onClick={openAddForm}>
            <Plus size={18} />
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="seller-product-grid">
          {products.map((product) => (
            <article
              className="seller-product-card"
              key={product.id}
            >
              <div className="seller-product-image">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                  />
                ) : (
                  <div className="seller-no-image">
                    <ImagePlus size={35} />
                    <span>No image</span>
                  </div>
                )}

                <span
                  className={
                    product.status === "active"
                      ? "seller-product-status active"
                      : "seller-product-status inactive"
                  }
                >
                  {product.status || "unknown"}
                </span>
              </div>

              <div className="seller-product-content">
                <h3>{product.name}</h3>

                <p className="seller-product-description">
                  {product.description || "No description provided."}
                </p>

                <div className="seller-product-information">
                  <strong>
                    LKR {Number(product.price).toLocaleString("en-LK")}
                  </strong>

                  <span>
                    Stock: {product.stock ?? 0}
                  </span>
                </div>

                {/* ONLY EDIT AND DELETE BUTTONS */}
                <div className="seller-product-actions">
                  <button
                    className="seller-edit-button"
                    onClick={() => openEditForm(product)}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    className="seller-delete-button"
                    onClick={() => removeProduct(product)}
                    title="Remove from marketplace"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerProducts;
