
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  ShoppingBag,
  BookOpen,
  Laptop,
  Package,
  RefreshCw,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "../styles/marketplace.css";

const fallbackImages = {
  stationery:
    "/images/Stationary.jpg.jpeg",
  electronics:
    "/images/Electronic items.jpg",
  bags:
    "/images/bags.jpg",
  books:
    "/images/programme fundamentals.jpg",
};

function getFallbackImage(product) {
  const name = (product.name || "").toLowerCase();

  if (name.includes("laptop bag") || name.includes("laptopbag")) return "/images/market laptopbag.jpg";
  if (name.includes("bag") || name.includes("backpack")) return "/images/bags.jpg";
  if (name.includes("stapler") || name.includes("stepler")) return "/images/market stepler.jpg";
  if (name.includes("programming fundamentals")) return "/images/market_programming fundamentals.jpg";
  if (name.includes("pen")) return "/images/market_premium pen collection.jpg";
  if (name.includes("calculator")) return "/images/market_calculator.jpg";
  if (name.includes("water bottle") || name.includes("bottle")) return "/images/market_resuable water bottles.jpg";

  if (name.includes("book") || name.includes("notes")) {
    return fallbackImages.books;
  }

  if (
    name.includes("laptop") ||
    name.includes("calculator") ||
    name.includes("headphone") ||
    name.includes("electronic")
  ) {
    return fallbackImages.electronics;
  }

  if (name.includes("bag") || name.includes("backpack")) {
    return fallbackImages.bags;
  }

  return fallbackImages.stationery;
}

function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );

  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  async function fetchMarketplaceData() {
    setLoading(true);
    setError("");

    try {
      const [productResult, categoryResult] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, name, description, price, image_url, category_id, stock, created_at"
          )
          .eq("status", "active")
          .order("created_at", { ascending: false }),

        supabase
          .from("categories")
          .select("id, name, module")
          .eq("module", "marketplace")
          .order("id", { ascending: true }),
      ]);

      if (productResult.error) throw productResult.error;
      if (categoryResult.error) throw categoryResult.error;

      setProducts(productResult.data || []);
      setCategories(categoryResult.data || []);
    } catch (err) {
      console.error("Marketplace loading error:", err);
      setError(
        "We couldn't load the marketplace right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function scrollToProducts() {
    window.setTimeout(() => {
      document
        .getElementById("marketplace-products")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 120);
  }

  function updateSearch(value) {
    setSearchTerm(value);

    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    setSearchParams(params, { replace: true });
  }

  function chooseCategory(categoryId) {
    setSelectedCategory(categoryId);

    const params = new URLSearchParams(searchParams);

    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }

    setSearchParams(params, { replace: true });
    scrollToProducts();
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortOption("newest");
    setSearchParams({}, { replace: true });
    scrollToProducts();
  }

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((product) => {
        const name = (product.name || "").toLowerCase();

  if (name.includes("laptop bag") || name.includes("laptopbag")) return "/images/market laptopbag.jpg";
  if (name.includes("bag") || name.includes("backpack")) return "/images/bags.jpg";
  if (name.includes("stapler") || name.includes("stepler")) return "/images/market stepler.jpg";
  if (name.includes("programming fundamentals")) return "/images/market_programming fundamentals.jpg";
  if (name.includes("pen")) return "/images/market_premium pen collection.jpg";
  if (name.includes("calculator")) return "/images/market_calculator.jpg";
  if (name.includes("water bottle") || name.includes("bottle")) return "/images/market_resuable water bottles.jpg";
        const description = (product.description || "").toLowerCase();

        return name.includes(search) || description.includes(search);
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          String(product.category_id) === String(selectedCategory)
      );
    }

    if (sortOption === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortOption === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortOption]);

  function formatPrice(price) {
    return `LKR ${Number(price || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function getCategoryIcon(categoryName) {
    const name = (categoryName || "").toLowerCase();

    if (name.includes("book")) return <BookOpen size={18} />;
    if (name.includes("electronic")) return <Laptop size={18} />;
    if (name.includes("stationery")) return <Package size={18} />;

    return <ShoppingBag size={18} />;
  }

  return (
    <main className="marketplace-page">

      {/* HERO SECTION */}
      <section className="marketplace-hero">
        <div className="marketplace-hero-overlay" />

        <div className="marketplace-hero-content">
          <span className="marketplace-eyebrow">
            <Sparkles size={16} />
            THE UNIORA MARKETPLACE
          </span>

          <h1>
            Everything you need,
            <br />
            <span>all in one place.</span>
          </h1>

          <p>
            Discover stationery, electronics, books and everyday
            essentials from the UNIORA student marketplace.
          </p>

          <form
            className="marketplace-search"
            onSubmit={(event) => {
              event.preventDefault();
              scrollToProducts();
            }}
          >
            <Search size={21} />

            <input
              type="search"
              placeholder="Search products, books, stationery..."
              value={searchTerm}
              onChange={(event) => updateSearch(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="marketplace-clear-search"
                onClick={() => updateSearch("")}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}

            <button type="submit">Search</button>
          </form>

          <div className="marketplace-hero-points">
            <span>
              <ShoppingBag size={16} />
              Student-friendly shopping
            </span>
            <span>
              <Package size={16} />
              Everyday essentials
            </span>
          </div>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="marketplace-category-section">
        <div className="marketplace-section-heading">
          <div>
            <span className="marketplace-small-label">
              SHOP BY CATEGORY
            </span>
            <h2>Find what you're looking for</h2>
            <p>
              Choose a category to see its available products immediately.
            </p>
          </div>
        </div>

        <div className="marketplace-category-list">
          <button
            type="button"
            className={`marketplace-category-chip ${
              selectedCategory === "all" ? "active" : ""
            }`}
            onClick={() => chooseCategory("all")}
          >
            <ShoppingBag size={18} />
            All products
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`marketplace-category-chip ${
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

      {/* PRODUCTS - NOW DIRECTLY BELOW CATEGORIES */}
      <section
        className="marketplace-products-section"
        id="marketplace-products"
      >
        <div className="marketplace-products-heading">
          <div>
            <span className="marketplace-small-label">
              THE COLLECTION
            </span>

            <h2>
              {selectedCategory === "all"
                ? "Explore our products"
                : categories.find(
                    (category) =>
                      String(category.id) === String(selectedCategory)
                  )?.name || "Explore our products"}
            </h2>

            <p>
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} product${
                    filteredProducts.length === 1 ? "" : "s"
                  } available`}
            </p>
          </div>

          <div className="marketplace-product-controls">
            <div className="marketplace-sort">
              <SlidersHorizontal size={18} />

              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
                aria-label="Sort products"
              >
                <option value="newest">Newest first</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="name">Name: A to Z</option>
              </select>

              <ChevronDown size={15} />
            </div>

            {(searchTerm || selectedCategory !== "all") && (
              <button
                type="button"
                className="marketplace-reset-button"
                onClick={clearFilters}
              >
                <X size={15} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="marketplace-status">
            <div className="marketplace-loader" />
            <p>Finding products for you...</p>
          </div>
        ) : error ? (
          <div className="marketplace-status marketplace-error">
            <p>{error}</p>
            <button type="button" onClick={fetchMarketplaceData}>
              <RefreshCw size={17} />
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="marketplace-empty">
            <div className="marketplace-empty-icon">
              <ShoppingBag size={35} />
            </div>

            <h3>No products found</h3>

            <p>
              Try another search or choose a different category.
            </p>

            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="marketplace-product-grid">
            {filteredProducts.map((product) => {
              const category = categories.find(
                (item) =>
                  String(item.id) === String(product.category_id)
              );

              const image =
                product.image_url || getFallbackImage(product);

              return (
                <Link
                  to={`/product/${product.id}`}
                  className="marketplace-product-card"
                  key={product.id}
                >
                  <div className="marketplace-product-image">
                    <img
                      src={image}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          getFallbackImage(product);
                      }}
                    />

                    {category && (
                      <span className="marketplace-product-category">
                        {category.name}
                      </span>
                    )}

                    {Number(product.stock) <= 0 && (
                      <span className="marketplace-out-of-stock">
                        Out of stock
                      </span>
                    )}
                  </div>

                  <div className="marketplace-product-info">
                    <h3>{product.name}</h3>

                    <p className="marketplace-product-description">
                      {product.description ||
                        "A useful everyday essential for student life."}
                    </p>

                    <div className="marketplace-product-bottom">
                      <strong>{formatPrice(product.price)}</strong>

                      <span className="marketplace-product-arrow">
                        <ArrowRight size={18} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* PROMOTIONAL BANNER - MOVED BELOW PRODUCTS */}
      <section className="marketplace-middle-banner">
        <div className="marketplace-middle-overlay" />

        <div className="marketplace-middle-content">
          <span>MADE FOR EVERYDAY CAMPUS LIFE</span>

          <h2>Small essentials. Big possibilities.</h2>

          <p>
            From your next notebook to useful tech accessories,
            discover products that make student life easier.
          </p>

          <button
            type="button"
            onClick={() => {
              clearFilters();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Explore products <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="marketplace-bottom-cta">
        <div>
          <span>YOUR CAMPUS. YOUR MARKETPLACE.</span>
          <h2>Discover something useful today.</h2>
          <p>
            Explore the collection and find something that makes
            your everyday university life easier.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        >
          Back to top <ArrowRight size={18} />
        </button>
      </section>

    </main>
  );
}

export default Marketplace;
