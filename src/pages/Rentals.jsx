
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Search,
  Plus,
  X,
  Camera,
  Lightbulb,
  Shirt,
  Volume2,
  Projector,
  Laptop,
  Dumbbell,
  Armchair,
  CalendarDays,
  MapPin,
  Package,
  Upload,
  Trash2,
  Pencil,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Boxes,
  LoaderCircle,
  Image as ImageIcon
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "../styles/rentals.css";

const rentalCategories = [
  {
    name: "Costumes & Traditional Wear",
    description: "Traditional, cultural and event costumes",
    image: "/images/rental-dancing.jpg",
    icon: Shirt,
    keywords: ["costume", "traditional", "dance", "wear"]
  },
  {
    name: "Lighting & Decoration",
    description: "Stage, party and decorative lighting",
    image: "/images/rental-lighting.jpg",
    icon: Lightbulb,
    keywords: ["lighting", "light", "decoration"]
  },
  {
    name: "Photography & Videography",
    description: "Cameras and photography equipment",
    image: "/images/rental-photography.jpg",
    icon: Camera,
    keywords: ["camera", "photography", "video"]
  },
  {
    name: "Audio & Sound Equipment",
    description: "Speakers, microphones and sound systems",
    image: "/images/rental-sound.jpg",
    icon: Volume2,
    keywords: ["speaker", "sound", "audio", "microphone"]
  },
  {
    name: "Projectors & Presentation",
    description: "Projectors and presentation equipment",
    image: "/images/rental-projector.jpg",
    icon: Projector,
    keywords: ["projector", "presentation", "screen"]
  },
  {
    name: "Academic & Technology",
    description: "Laptops, tablets and academic equipment",
    image: "/images/rentalacademic-tech.jpg",
    icon: Laptop,
    keywords: ["laptop", "technology", "academic", "computer", "tablet"]
  },
  {
    name: "Sports & Outdoor",
    description: "Sports and outdoor activity equipment",
    image: "/images/rental-sports.jpg",
    icon: Dumbbell,
    keywords: ["sport", "outdoor", "fitness"]
  },
  {
    name: "Event Furniture & Party Equipment",
    description: "Tables, chairs and party equipment",
    image: "/images/rental-party-furniture.jpg",
    icon: Armchair,
    keywords: ["furniture", "party", "chair", "table", "event"]
  }
];

const emptyForm = {
  name: "",
  description: "",
  category_id: "",
  price_per_day: ""
};

function formatPrice(value) {
  return `LKR ${Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDate(value) {
  if (!value) return "Not specified";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getCategoryName(categoryId, categories) {
  const category = categories.find(
    item => Number(item.id) === Number(categoryId)
  );

  return category?.name || "Other Rentals";
}

function Rentals() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [bookingListing, setBookingListing] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const currentUser = authData?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profileError) throw profileError;

        setRole(profile?.role || "");
      }

      await Promise.all([
        loadCategories(),
        loadListings(),
        currentUser ? loadBookings() : Promise.resolve()
      ]);
    } catch (err) {
      setError(err.message || "Unable to load the rentals page.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    const { data, error: fetchError } = await supabase
      .from("categories")
      .select("id, name, module")
      .eq("module", "rentals")
      .order("id");

    if (fetchError) throw fetchError;

    setCategories(data || []);
  }

  async function loadListings() {
    const { data, error: fetchError } = await supabase
      .from("rental_listings")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    setListings(data || []);
  }

  async function loadBookings() {
    const { data, error: fetchError } = await supabase
      .from("rental_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    setBookings(data || []);
  }

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      const categoryName = getCategoryName(item.category_id, categories);
      const searchText = search.toLowerCase();

      const matchesSearch =
        (item.name || "").toLowerCase().includes(searchText) ||
        (item.description || "").toLowerCase().includes(searchText) ||
        categoryName.toLowerCase().includes(searchText);

      let matchesCategory = true;

      if (selectedCategory) {
        const selected = rentalCategories.find(
          category => category.name === selectedCategory
        );

        const currentCategory = categoryName.toLowerCase();

        matchesCategory = selected
          ? selected.keywords.some(keyword =>
              currentCategory.includes(keyword)
            )
          : false;
      }

      return matchesSearch && matchesCategory;
    });
  }, [listings, categories, search, selectedCategory]);

  const myListings = listings.filter(
    item => item.owner_id === user?.id
  );

  const myBookings = bookings.filter(
    item => item.renter_id === user?.id
  );

  const incomingBookings = bookings.filter(
    item => item.owner_id === user?.id
  );

  function openCreateForm() {
    if (!user) {
      setNotice("Please log in to publish a rental listing.");
      return;
    }

    if (role !== "seller") {
      setNotice("Only seller accounts can publish rental listings.");
      return;
    }

    setForm(emptyForm);
    setSelectedImage(null);
    setImagePreview("");
    setEditingId(null);
    setShowForm(true);
    setNotice("");
    setError("");
  }

  function openEditForm(item) {
    setForm({
      name: item.name || "",
      description: item.description || "",
      category_id: String(item.category_id || ""),
      price_per_day: String(item.price_per_day || "")
    });

    setSelectedImage(null);
    setImagePreview(item.image_url || "");
    setEditingId(item.id);
    setShowForm(true);
    setNotice("");
    setError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }

  async function uploadListingImage() {
    if (!selectedImage || !user) return imagePreview;

    const extension = selectedImage.name.split(".").pop();
    const filePath =
      `rentals/${user.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, selectedImage, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function saveListing(event) {
    event.preventDefault();

    if (!user || role !== "seller") {
      setError("Please log in with a seller account to publish listings.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.category_id ||
      !form.price_per_day ||
      Number(form.price_per_day) <= 0
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const uploadedImage = selectedImage
        ? await uploadListingImage()
        : imagePreview;

      const listingData = {
        owner_id: user.id,
        category_id: Number(form.category_id),
        name: form.name.trim(),
        description: form.description.trim(),
        price_per_day: Number(form.price_per_day),
        image_url: uploadedImage || null
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("rental_listings")
          .update(listingData)
          .eq("id", editingId)
          .eq("owner_id", user.id);
      } else {
        result = await supabase
          .from("rental_listings")
          .insert({
            ...listingData,
            status: "available"
          });
      }

      if (result.error) throw result.error;

      setShowForm(false);
      setForm(emptyForm);
      setSelectedImage(null);
      setImagePreview("");
      setEditingId(null);

      await loadListings();

      setNotice(
        editingId
          ? "Your rental listing has been updated."
          : "Your rental listing has been published successfully."
      );
    } catch (err) {
      setError(err.message || "Unable to save your rental listing.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteListing(item) {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${item.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    const { error: deleteError } = await supabase
      .from("rental_listings")
      .delete()
      .eq("id", item.id)
      .eq("owner_id", user.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadListings();
    setNotice("Rental listing removed successfully.");
  }

  function openBooking(item) {
    if (!user) {
      setNotice("Please log in to book rental equipment.");
      return;
    }

    if (role !== "student") {
      setNotice("Student accounts can make rental bookings.");
      return;
    }

    setBookingListing(item);
    setBookingForm({
      start_date: "",
      end_date: ""
    });
    setNotice("");
    setError("");
  }

  function calculateRentalDays(start, end) {
    if (!start || !end) return 0;

    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);

    const difference = endDate - startDate;

    if (difference < 0) return 0;

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  }

  const rentalDays = calculateRentalDays(
    bookingForm.start_date,
    bookingForm.end_date
  );

  const rentalTotal = rentalDays * Number(
    bookingListing?.price_per_day || 0
  );

  async function submitBooking(event) {
    event.preventDefault();

    if (!user || !bookingListing) return;

    if (!bookingForm.start_date || !bookingForm.end_date) {
      setError("Please select both rental dates.");
      return;
    }

    if (bookingForm.end_date < bookingForm.start_date) {
      setError("The return date cannot be before the start date.");
      return;
    }

    if (rentalDays < 1) {
      setError("Please select valid rental dates.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const bookingData = {
      listing_id: bookingListing.id,
      renter_id: user.id,
      owner_id: bookingListing.owner_id,
      start_date: bookingForm.start_date,
      end_date: bookingForm.end_date,
      total_amount: rentalTotal,
      status: "pending"
    };

    const { error: bookingError } = await supabase
      .from("rental_bookings")
      .insert(bookingData);

    if (bookingError) {
      setError(bookingError.message);
      setSaving(false);
      return;
    }

    setBookingListing(null);
    await loadBookings();

    setNotice("Your rental request has been sent to the owner.");
    setSaving(false);
    setActiveTab("my-bookings");
  }

  async function updateBookingStatus(bookingId, newStatus) {
    setError("");
    setNotice("");

    const { error: updateError } = await supabase
      .from("rental_bookings")
      .update({ status: newStatus })
      .eq("id", bookingId)
      .eq("owner_id", user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadBookings();

    setNotice(`Booking ${newStatus} successfully.`);
  }

  function scrollToListings() {
    document
      .getElementById("rental-listings")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseCategory(categoryName) {
    setSelectedCategory(previous =>
      previous === categoryName ? "" : categoryName
    );

    scrollToListings();
  }

  return (
    <main className="rentals-page">

      {/* HERO SECTION */}

      <section className="rentals-hero">
        <img
          className="rentals-hero-background"
          src="/images/rental-hero.jpg"
          alt=""
        />

        <div className="rentals-hero-overlay" />

        <div className="rentals-hero-content">
          <span className="rentals-eyebrow">
            <Sparkles size={16} />
            RENT SMART WITH UNIORA
          </span>

          <h1>
            Find what you need.
            <br />
            <span>Rent with ease.</span>
          </h1>

          <p>
            From costumes and cameras to sound systems and study
            equipment, discover useful items available for rent
            within the UNIORA community.
          </p>

          <button
            type="button"
            className="rentals-hero-button"
            onClick={scrollToListings}
          >
            Explore rentals
            <ArrowRight size={19} />
          </button>
        </div>
      </section>

      {/* INTRODUCTION */}

      <section className="rentals-intro">
        <span className="rentals-eyebrow">DISCOVER AND RENT</span>

        <h2>Everything you need, all in one place.</h2>

        <p>
          Explore useful equipment shared by students and sellers.
          Choose a category, find what you need and send a rental request.
        </p>
      </section>

      {/* EIGHT RENTAL CATEGORIES */}

      <section className="rentals-category-section">
        <div className="rentals-section-heading">
          <div>
            <span className="rentals-eyebrow">EXPLORE CATEGORIES</span>
            <h2>Find your essentials</h2>
            <p>Choose a category to explore available rental items.</p>
          </div>
        </div>

        <div className="rentals-category-grid">
          {rentalCategories.map(category => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.name;

            return (
              <button
                type="button"
                key={category.name}
                className={`rental-category-card ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => chooseCategory(category.name)}
              >
                <div className="rental-category-image">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                  />
                </div>

                <div className="rental-category-details">
                  <span className="rental-category-icon">
                    <Icon size={21} />
                  </span>

                  <strong>{category.name}</strong>

                  <small>{category.description}</small>

                  <span className="rental-category-explore">
                    Explore items
                    <ArrowRight size={16} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* LARGE PROMOTIONAL CARD */}

      <section className="rentals-feature-section">
        <div className="rentals-feature-image">
          <img
            src="/images/rental-middle%20(2).jpg"
            alt="Students sharing useful rental equipment"
            loading="lazy"
          />
        </div>

        <div className="rentals-feature-content">
          <span className="rentals-eyebrow">
            A SMARTER WAY TO RENT
          </span>

          <h2>
            Use what you need,
            <br />
            for the time you need it.
          </h2>

          <p>
            Discover equipment shared by the UNIORA community.
            From academic technology and sports equipment to
            costumes and event essentials, find what you need
            without purchasing everything yourself.
          </p>

          <button type="button" onClick={scrollToListings}>
            Explore available rentals
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* LISTINGS SECTION */}

      <section
        className="rentals-listings-section"
        id="rental-listings"
      >
        <div className="rentals-listings-inner">

          <div className="rentals-section-heading rentals-main-heading">
            <div>
              <span className="rentals-eyebrow">THE RENTAL COLLECTION</span>
              <h2>Explore available items</h2>
              <p>
                Find equipment and essentials shared by the UNIORA community.
              </p>
            </div>

            {role === "seller" && (
              <button
                type="button"
                className="rentals-add-button"
                onClick={openCreateForm}
              >
                <Plus size={18} />
                Add rental item
              </button>
            )}
          </div>

          {/* NOTICES */}

          {notice && (
            <div className="rentals-notice success">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Close">
                <X size={17} />
              </button>
            </div>
          )}

          {error && (
            <div className="rentals-notice error">
              <XCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Close">
                <X size={17} />
              </button>
            </div>
          )}

          {/* TABS */}

          <div className="rentals-tabs">
            <button
              className={activeTab === "browse" ? "active" : ""}
              onClick={() => setActiveTab("browse")}
            >
              All available items
            </button>

            {user && (
              <button
                className={activeTab === "my-bookings" ? "active" : ""}
                onClick={() => setActiveTab("my-bookings")}
              >
                My bookings
              </button>
            )}

            {role === "seller" && (
              <>
                <button
                  className={activeTab === "my-listings" ? "active" : ""}
                  onClick={() => setActiveTab("my-listings")}
                >
                  My listings
                </button>

                <button
                  className={activeTab === "requests" ? "active" : ""}
                  onClick={() => setActiveTab("requests")}
                >
                  Rental requests
                  {incomingBookings.filter(
                    item => item.status === "pending"
                  ).length > 0 && (
                    <span className="rentals-tab-count">
                      {incomingBookings.filter(
                        item => item.status === "pending"
                      ).length}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* BROWSE TAB */}

          {activeTab === "browse" && (
            <>
              <div className="rentals-filter-bar">
                <div className="rentals-search">
                  <Search size={19} />

                  <input
                    type="text"
                    placeholder="Search rental items..."
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                  />

                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>

                <select
                  value={selectedCategory}
                  onChange={event =>
                    setSelectedCategory(event.target.value)
                  }
                >
                  <option value="">All categories</option>
                  {rentalCategories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory && (
                <div className="rentals-active-filter">
                  Showing: <strong>{selectedCategory}</strong>
                  <button onClick={() => setSelectedCategory("")}>
                    Clear filter <X size={14} />
                  </button>
                </div>
              )}

              {loading ? (
                <div className="rentals-loading">
                  <LoaderCircle className="spin" size={32} />
                  <p>Loading rental items...</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="rentals-empty">
                  <Boxes size={40} />
                  <h3>No rental items found</h3>
                  <p>
                    Try another search or category. New rental items
                    may be added soon.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("");
                    }}
                  >
                    View all items
                  </button>
                </div>
              ) : (
                <div className="rentals-items-grid">
                  {filteredListings.map(item => (
                    <article className="rental-item-card" key={item.id}>
                      <div className="rental-item-image">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="rental-no-photo">
                            <ImageIcon size={35} />
                            <span>No image available</span>
                          </div>
                        )}

                        <span className="rental-item-category">
                          {getCategoryName(item.category_id, categories)}
                        </span>
                      </div>

                      <div className="rental-item-content">
                        <h3>{item.name}</h3>

                        <p>
                          {item.description ||
                            "Contact the owner for more information."}
                        </p>

                        <div className="rental-item-price">
                          <strong>
                            {formatPrice(item.price_per_day)}
                          </strong>
                          <span>/ day</span>
                        </div>

                        <button
                          type="button"
                          className="rental-book-button"
                          onClick={() => openBooking(item)}
                        >
                          Request to rent
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* MY LISTINGS TAB */}

          {activeTab === "my-listings" && (
            <div className="rentals-tab-content">
              <div className="rentals-provider-heading">
                <div>
                  <h3>Your rental listings</h3>
                  <p>Manage the equipment you share with students.</p>
                </div>

                <button
                  className="rentals-add-button"
                  onClick={openCreateForm}
                >
                  <Plus size={17} />
                  Add new listing
                </button>
              </div>

              {myListings.length === 0 ? (
                <div className="rentals-empty">
                  <Package size={38} />
                  <h3>You haven't published any rentals yet</h3>
                  <p>Add your first rental item to get started.</p>
                  <button onClick={openCreateForm}>
                    Publish a rental item
                  </button>
                </div>
              ) : (
                <div className="rentals-items-grid">
                  {myListings.map(item => (
                    <article className="rental-item-card" key={item.id}>
                      <div className="rental-item-image">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} />
                        ) : (
                          <div className="rental-no-photo">
                            <ImageIcon size={35} />
                            <span>No image available</span>
                          </div>
                        )}

                        <span className="rental-item-category">
                          {getCategoryName(item.category_id, categories)}
                        </span>
                      </div>

                      <div className="rental-item-content">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>

                        <div className="rental-item-price">
                          <strong>{formatPrice(item.price_per_day)}</strong>
                          <span>/ day</span>
                        </div>

                        <div className="rental-owner-actions">
                          <button onClick={() => openEditForm(item)}>
                            <Pencil size={15} /> Edit
                          </button>

                          <button
                            className="delete"
                            onClick={() => deleteListing(item)}
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY BOOKINGS TAB */}

          {activeTab === "my-bookings" && (
            <div className="rentals-tab-content">
              <div className="rentals-provider-heading">
                <div>
                  <h3>My rental bookings</h3>
                  <p>Check the status of your rental requests.</p>
                </div>
              </div>

              {myBookings.length === 0 ? (
                <div className="rentals-empty">
                  <CalendarDays size={38} />
                  <h3>No bookings yet</h3>
                  <p>Your rental requests will appear here.</p>
                  <button onClick={() => setActiveTab("browse")}>
                    Explore rentals
                  </button>
                </div>
              ) : (
                <div className="rentals-bookings-list">
                  {myBookings.map(booking => {
                    const item = listings.find(
                      listing => Number(listing.id) === Number(booking.listing_id)
                    );

                    return (
                      <article
                        className="rental-booking-row"
                        key={booking.id}
                      >
                        <div className="rental-booking-info">
                          <h3>{item?.name || "Rental item"}</h3>

                          <p>
                            <CalendarDays size={15} />
                            {formatDate(booking.start_date)} –{" "}
                            {formatDate(booking.end_date)}
                          </p>

                          <strong>
                            {formatPrice(booking.total_amount)}
                          </strong>
                        </div>

                        <span
                          className={`rental-status ${booking.status}`}
                        >
                          {booking.status}
                        </span>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* INCOMING REQUESTS TAB */}

          {activeTab === "requests" && role === "seller" && (
            <div className="rentals-tab-content">
              <div className="rentals-provider-heading">
                <div>
                  <h3>Incoming rental requests</h3>
                  <p>Review and manage requests from students.</p>
                </div>
              </div>

              {incomingBookings.length === 0 ? (
                <div className="rentals-empty">
                  <Clock size={38} />
                  <h3>No rental requests yet</h3>
                  <p>New student requests will appear here.</p>
                </div>
              ) : (
                <div className="rentals-bookings-list">
                  {incomingBookings.map(booking => {
                    const item = listings.find(
                      listing => Number(listing.id) === Number(booking.listing_id)
                    );

                    return (
                      <article
                        className="rental-booking-row"
                        key={booking.id}
                      >
                        <div className="rental-booking-info">
                          <h3>{item?.name || "Rental item"}</h3>

                          <p>
                            <CalendarDays size={15} />
                            {formatDate(booking.start_date)} –{" "}
                            {formatDate(booking.end_date)}
                          </p>

                          <strong>
                            {formatPrice(booking.total_amount)}
                          </strong>
                        </div>

                        <div className="rental-booking-actions">
                          <span
                            className={`rental-status ${booking.status}`}
                          >
                            {booking.status}
                          </span>

                          {booking.status === "pending" && (
                            <>
                              <button
                                className="rental-accept"
                                onClick={() =>
                                  updateBookingStatus(
                                    booking.id,
                                    "accepted"
                                  )
                                }
                              >
                                <CheckCircle2 size={15} />
                                Accept
                              </button>

                              <button
                                className="rental-reject"
                                onClick={() =>
                                  updateBookingStatus(
                                    booking.id,
                                    "rejected"
                                  )
                                }
                              >
                                <XCircle size={15} />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM PROMOTIONAL SECTION */}

      <section className="rentals-bottom-cta">
        <img
          src="/images/rental-middle%20(2).jpg"
          alt=""
          className="rentals-bottom-background"
        />

        <div className="rentals-bottom-overlay" />

        <div className="rentals-bottom-content">
          <span className="rentals-eyebrow">
            SHARE MORE. WASTE LESS.
          </span>

          <h2>Have equipment to share?</h2>

          <p>
            Make useful items available to other students.
            Turn the things you own into opportunities within
            the UNIORA community.
          </p>
        </div>

        {role === "seller" ? (
          <button onClick={openCreateForm}>
            Add your rental item
            <ArrowRight size={17} />
          </button>
        ) : (
          <button onClick={() => setActiveTab("browse")}>
            Explore rentals
            <ArrowRight size={17} />
          </button>
        )}
      </section>

      {/* PUBLISH / EDIT LISTING FORM */}

      {showForm && (
        <div
          className="rentals-modal-backdrop"
          onClick={event => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <form className="rentals-form" onSubmit={saveListing}>
            <div className="rentals-form-heading">
              <div>
                <span className="rentals-eyebrow">
                  {editingId ? "UPDATE YOUR ITEM" : "SHARE WITH STUDENTS"}
                </span>

                <h3>
                  {editingId ? "Edit rental listing" : "Add a rental item"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <label>Item name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Example: DSLR Camera"
              required
            />

            <label>Category *</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleFormChange}
              required
            >
              <option value="">Choose a category</option>

              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows="4"
              placeholder="Describe the item, its condition and any useful details..."
            />

            <label>Rental price per day (LKR) *</label>
            <input
              type="number"
              name="price_per_day"
              value={form.price_per_day}
              onChange={handleFormChange}
              min="1"
              step="0.01"
              placeholder="Example: 1500"
              required
            />

            <label>Item photograph</label>

            <label className="rentals-upload-area">
              <Upload size={24} />
              <strong>Choose an image</strong>
              <small>JPG, PNG or WEBP · Maximum 5 MB</small>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {imagePreview && (
              <div className="rentals-upload-preview">
                <img src={imagePreview} alt="Selected rental item" />

                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview("");
                  }}
                >
                  <Trash2 size={15} />
                  Remove image
                </button>
              </div>
            )}

            {error && (
              <p className="rentals-form-error">{error}</p>
            )}

            <div className="rentals-form-actions">
              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <LoaderCircle className="spin" size={17} />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingId ? "Save changes" : "Publish listing"}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENTAL BOOKING FORM */}

      {bookingListing && (
        <div
          className="rentals-modal-backdrop"
          onClick={event => {
            if (event.target === event.currentTarget) {
              setBookingListing(null);
            }
          }}
        >
          <form className="rentals-form" onSubmit={submitBooking}>
            <div className="rentals-form-heading">
              <div>
                <span className="rentals-eyebrow">RENTAL REQUEST</span>
                <h3>Book {bookingListing.name}</h3>
              </div>

              <button
                type="button"
                onClick={() => setBookingListing(null)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rentals-booking-price">
              <span>Rental rate</span>
              <strong>
                {formatPrice(bookingListing.price_per_day)} / day
              </strong>
            </div>

            <label>Rental start date *</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={bookingForm.start_date}
              onChange={event =>
                setBookingForm(previous => ({
                  ...previous,
                  start_date: event.target.value
                }))
              }
              required
            />

            <label>Return date *</label>
            <input
              type="date"
              min={
                bookingForm.start_date ||
                new Date().toISOString().split("T")[0]
              }
              value={bookingForm.end_date}
              onChange={event =>
                setBookingForm(previous => ({
                  ...previous,
                  end_date: event.target.value
                }))
              }
              required
            />

            <div className="rentals-booking-summary">
              <div>
                <span>Number of days</span>
                <strong>{rentalDays}</strong>
              </div>

              <div>
                <span>Total rental amount</span>
                <strong>{formatPrice(rentalTotal)}</strong>
              </div>
            </div>

            <p className="rentals-booking-note">
              Your request will be sent to the item owner.
              The booking is not confirmed until the owner accepts it.
            </p>

            {error && (
              <p className="rentals-form-error">{error}</p>
            )}

            <div className="rentals-form-actions">
              <button
                type="button"
                onClick={() => setBookingListing(null)}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || rentalDays < 1}
              >
                {saving ? "Sending..." : "Send rental request"}
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </div>
      )}

    </main>
  );
}

export default Rentals;
