
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  X,
  Camera,
  Recycle,
  BookOpen,
  Laptop,
  Shirt,
  Armchair,
  Package,
  ArrowRight,
  MapPin,
  Tag,
  RefreshCw,
  CheckCircle,
  ImagePlus,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "../styles/secondhand.css";

const conditionOptions = [
  { value: "new", label: "Brand new" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const fallbackImage =
  "/images/used items_Calculator.jpg";

function SecondHand() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [showMyListings, setShowMyListings] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    item_condition: "good",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initialise() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(currentUser || null);
      await loadData();
    }

    initialise();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [listingResult, categoryResult] = await Promise.all([
        supabase
          .from("secondhand_listings")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("categories")
          .select("id, name, module")
          .eq("module", "secondhand")
          .order("id", { ascending: true }),
      ]);

      if (listingResult.error) throw listingResult.error;
      if (categoryResult.error) throw categoryResult.error;

      setListings(listingResult.data || []);
      setCategories(categoryResult.data || []);
    } catch (err) {
      console.error("Second-hand loading error:", err);
      setError("Unable to load second-hand listings. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (showMyListings) {
      result = result.filter(
        (item) => user && item.seller_id === user.id
      );
    } else {
      result = result.filter(
        (item) =>
          item.status === "available" ||
          (user && item.seller_id === user.id)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (item) =>
          String(item.category_id) === String(selectedCategory)
      );
    }

    if (conditionFilter !== "all") {
      result = result.filter(
        (item) => item.item_condition === conditionFilter
      );
    }

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((item) => {
        return (
          (item.name || "").toLowerCase().includes(search) ||
          (item.description || "").toLowerCase().includes(search)
        );
      });
    }

    if (sortOption === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      );
    }

    return result;
  }, [
    listings,
    selectedCategory,
    conditionFilter,
    searchTerm,
    sortOption,
    showMyListings,
    user,
  ]);

  function scrollToListings() {
    document
      .getElementById("secondhand-listings")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function chooseCategory(categoryId) {
    setSelectedCategory(categoryId);
    setShowMyListings(false);

    setTimeout(scrollToListings, 100);
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      price: "",
      category_id: "",
      item_condition: "good",
    });

    setImageFile(null);
    setImagePreview("");
    setExistingImage("");
    setEditingId(null);
  }

  function openCreateForm() {
    if (!user) {
      alert("Please log in to publish a second-hand item.");
      return;
    }

    resetForm();
    setShowForm(true);
  }

  function openEditForm(item) {
    setForm({
      name: item.name || "",
      description: item.description || "",
      price: String(item.price ?? ""),
      category_id: item.category_id
        ? String(item.category_id)
        : "",
      item_condition: item.item_condition || "good",
    });

    setExistingImage(item.image_url || "");
    setImagePreview(item.image_url || "");
    setImageFile(null);
    setEditingId(item.id);
    setShowForm(true);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5 MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!imageFile) return existingImage || null;

    const extension = imageFile.name.split(".").pop() || "jpg";
    const filePath = `secondhand/${user.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      alert("Please log in before publishing an item.");
      return;
    }

    if (!form.name.trim() || !form.price || Number(form.price) < 0) {
      alert("Please enter a valid item name and price.");
      return;
    }

    if (!form.category_id) {
      alert("Please select an item category.");
      return;
    }

    setSaving(true);

    try {
      const imageUrl = await uploadImage();

      const itemData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category_id: Number(form.category_id),
        item_condition: form.item_condition,
        image_url: imageUrl,
        status: "available",
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("secondhand_listings")
          .update(itemData)
          .eq("id", editingId)
          .eq("seller_id", user.id);
      } else {
        result = await supabase
          .from("secondhand_listings")
          .insert({
            ...itemData,
            seller_id: user.id,
          });
      }

      if (result.error) throw result.error;

      setShowForm(false);
      resetForm();
      await loadData();

      alert(
        editingId
          ? "Your listing has been updated."
          : "Your item has been published successfully."
      );
    } catch (err) {
      console.error("Saving listing error:", err);
      alert(err.message || "Unable to save your listing.");
    } finally {
      setSaving(false);
    }
  }

  async function markAsSold(item) {
    const confirmed = window.confirm(
      `Mark "${item.name}" as sold?`
    );

    if (!confirmed) return;

    const { error: updateError } = await supabase
      .from("secondhand_listings")
      .update({ status: "sold" })
      .eq("id", item.id)
      .eq("seller_id", user.id);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    await loadData();
  }

  async function deleteListing(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("secondhand_listings")
      .delete()
      .eq("id", item.id)
      .eq("seller_id", user.id);

    if (deleteError) {
      alert(deleteError.message);
      return;
    }

    await loadData();
  }

  async function contactSeller(item) {
    if (!item.seller_id) {
      alert("Seller contact information is not available.");
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", item.seller_id)
      .maybeSingle();

    if (profileError || !data?.email) {
      alert(
        "The seller's email is not available. Please try contacting them later."
      );
      return;
    }

    const subject = encodeURIComponent(
      `UNIORA enquiry about ${item.name}`
    );

    const body = encodeURIComponent(
      `Hello,\n\nI am interested in your second-hand listing "${item.name}" on UNIORA.\n\nIs this item still available?\n\nThank you.`
    );

    window.location.href = `mailto:${data.email}?subject=${subject}&body=${body}`;
  }

  function formatPrice(price) {
    return `LKR ${Number(price || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function getConditionLabel(value) {
    return (
      conditionOptions.find((option) => option.value === value)?.label ||
      value ||
      "Used"
    );
  }

  function getCategoryName(categoryId) {
    return (
      categories.find(
        (category) => String(category.id) === String(categoryId)
      )?.name || "Other items"
    );
  }

  function getCategoryIcon(name) {
    const value = (name || "").toLowerCase();

    if (value.includes("book")) return <BookOpen size={19} />;
    if (value.includes("electronic")) return <Laptop size={19} />;
    if (value.includes("cloth")) return <Shirt size={19} />;
    if (value.includes("furniture")) return <Armchair size={19} />;

    return <Package size={19} />;
  }

  return (
    <main className="secondhand-page">

      {/* HERO */}
      <section className="secondhand-hero">
        <div className="secondhand-hero-shade" />

        <div className="secondhand-hero-content">
          <span className="secondhand-eyebrow">
            <Recycle size={17} />
            GIVE GOOD THINGS A SECOND LIFE
          </span>

          <h1>
            Pre-loved finds.
            <br />
            <span>New possibilities.</span>
          </h1>

          <p>
            Buy and sell pre-loved items within your university
            community. Find affordable essentials and give your
            unused belongings a new home.
          </p>

          <div className="secondhand-hero-actions">
            <button onClick={scrollToListings} type="button">
              Explore items <ArrowRight size={18} />
            </button>

            <button
              onClick={openCreateForm}
              type="button"
              className="secondhand-outline-button"
            >
              <Plus size={18} /> Sell an item
            </button>
          </div>

          <div className="secondhand-hero-note">
            <span><CheckCircle size={16} /> Student community</span>
            <span><Recycle size={16} /> Reuse and save</span>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTERS */}
      <section className="secondhand-category-section">
        <div className="secondhand-section-title">
          <div>
            <span className="secondhand-label">DISCOVER PRE-LOVED ITEMS</span>
            <h2>Explore by category</h2>
            <p>Find something useful at a student-friendly price.</p>
          </div>

          <button
            type="button"
            className="secondhand-sell-top"
            onClick={openCreateForm}
          >
            <Plus size={17} /> Publish an item
          </button>
        </div>

        <div className="secondhand-category-list">
          <button
            type="button"
            className={`secondhand-category-chip ${
              selectedCategory === "all" ? "active" : ""
            }`}
            onClick={() => chooseCategory("all")}
          >
            <Package size={18} /> All items
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`secondhand-category-chip ${
                String(selectedCategory) === String(category.id)
                  ? "active"
                  : ""
              }`}
              onClick={() => chooseCategory(String(category.id))}
            >
              {getCategoryIcon(category.name)}
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* LISTINGS */}
      <section
        className="secondhand-listings-section"
        id="secondhand-listings"
      >
        <div className="secondhand-listings-heading">
          <div>
            <span className="secondhand-label">
              THE SECOND-HAND COLLECTION
            </span>
            <h2>
              {showMyListings ? "My listings" : "Find your next favourite"}
            </h2>
            <p>
              {filteredListings.length} item
              {filteredListings.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="secondhand-listing-tools">
            <div className="secondhand-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search second-hand items..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              className="secondhand-select"
              value={conditionFilter}
              onChange={(event) => setConditionFilter(event.target.value)}
              aria-label="Filter by condition"
            >
              <option value="all">All conditions</option>
              {conditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="secondhand-select"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
              aria-label="Sort listings"
            >
              <option value="newest">Newest first</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
            </select>
          </div>
        </div>

        <div className="secondhand-view-tabs">
          <button
            type="button"
            className={!showMyListings ? "active" : ""}
            onClick={() => setShowMyListings(false)}
          >
            All available items
          </button>

          {user && (
            <button
              type="button"
              className={showMyListings ? "active" : ""}
              onClick={() => setShowMyListings(true)}
            >
              My listings
            </button>
          )}
        </div>

        {loading ? (
          <div className="secondhand-status">
            <div className="secondhand-loader" />
            <p>Loading pre-loved finds...</p>
          </div>
        ) : error ? (
          <div className="secondhand-status">
            <p>{error}</p>
            <button type="button" onClick={loadData}>
              <RefreshCw size={17} /> Try again
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="secondhand-empty">
            <div className="secondhand-empty-icon">
              <Recycle size={35} />
            </div>
            <h3>No items found</h3>
            <p>
              Try another category or search term, or publish the first
              listing in this collection.
            </p>
            <button type="button" onClick={openCreateForm}>
              <Plus size={17} /> Publish an item
            </button>
          </div>
        ) : (
          <div className="secondhand-grid">
            {filteredListings.map((item) => {
              const isOwner = user && item.seller_id === user.id;
              const isSold = item.status === "sold";

              return (
                <article
                  className={`secondhand-card ${isSold ? "sold" : ""}`}
                  key={item.id}
                >
                 
                   <div className={`secondhand-card-image ${!item.image_url ? "no-image" : ""}`}>
                    {item.image_url && (
                     <img src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                           onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  )}

                    <span className="secondhand-card-category">
                      {getCategoryName(item.category_id)}
                    </span>

                    <span className="secondhand-condition">
                      {getConditionLabel(item.item_condition)}
                    </span>

                    {isSold && (
                      <span className="secondhand-sold-label">SOLD</span>
                    )}
                  </div>

                  <div className="secondhand-card-info">
                    <h3>{item.name}</h3>

                    <p className="secondhand-card-description">
                      {item.description ||
                        "A pre-loved item waiting for its next owner."}
                    </p>

                    <div className="secondhand-price-row">
                      <strong>{formatPrice(item.price)}</strong>
                      <span>
                        <Tag size={14} /> Pre-loved
                      </span>
                    </div>

                    <div className="secondhand-card-actions">
                      {!isOwner && !isSold && (
                        <button
                          type="button"
                          className="secondhand-contact-button"
                          onClick={() => contactSeller(item)}
                        >
                          Contact seller <ArrowRight size={16} />
                        </button>
                      )}

                      {isOwner && (
                        <>
                          {!isSold && (
                            <>
                              <button
                                type="button"
                                className="secondhand-edit-button"
                                onClick={() => openEditForm(item)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="secondhand-sold-button"
                                onClick={() => markAsSold(item)}
                              >
                                Mark sold
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="secondhand-delete-button"
                            onClick={() => deleteListing(item)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* PROMOTIONAL SECTION */}
      <section className="secondhand-promo">
        <div className="secondhand-promo-shade" />

        <div className="secondhand-promo-content">
          <span>BUY SMART. SELL EASY. REUSE MORE.</span>
          <h2>One student's unused item can be another student's best find.</h2>
          <p>
            Give your books, accessories, electronics and everyday
            essentials another chance to be useful.
          </p>

          <button type="button" onClick={openCreateForm}>
            Start selling <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* PUBLISH / EDIT MODAL */}
      {showForm && (
        <div
          className="secondhand-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
              resetForm();
            }
          }}
        >
          <div className="secondhand-modal">
            <div className="secondhand-modal-heading">
              <div>
                <span className="secondhand-label">
                  UNIORA SECOND-HAND
                </span>
                <h2>{editingId ? "Edit your listing" : "Sell an item"}</h2>
                <p>
                  Share an item with other students in your community.
                </p>
              </div>

              <button
                type="button"
                className="secondhand-modal-close"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="secondhand-form">
              <label>
                Item name *
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Scientific calculator"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe the item, its features and any details buyers should know..."
                />
              </label>

              <div className="secondhand-form-row">
                <label>
                  Price (LKR) *
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="e.g. 1500"
                    required
                  />
                </label>

                <label>
                  Condition *
                  <select
                    value={form.item_condition}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        item_condition: event.target.value,
                      })
                    }
                    required
                  >
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Category *
                <select
                  value={form.category_id}
                  onChange={(event) =>
                    setForm({ ...form, category_id: event.target.value })
                  }
                  required
                >
                  <option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="secondhand-image-upload">
                <span className="secondhand-upload-title">
                  <ImagePlus size={19} /> Item photo
                </span>

                <span className="secondhand-upload-help">
                  Choose a clear image of your item. Maximum size: 5 MB.
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Item preview"
                    className="secondhand-image-preview"
                  />
                ) : (
                  <span className="secondhand-upload-placeholder">
                    <Camera size={27} />
                    <span>Click to upload an image</span>
                  </span>
                )}
              </label>

              <div className="secondhand-form-actions">
                <button
                  type="button"
                  className="secondhand-cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="secondhand-submit-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save changes"
                    : "Publish listing"}
                  {!saving && <ArrowRight size={17} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default SecondHand;
