import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Recycle,
  GraduationCap,
  House,
  Search,
  ShieldCheck,
  Heart,
  ArrowRight,
  Camera,
  Wrench,
  Printer,
  CalendarDays,
  Sparkles,
  Users,
  Package,
  PartyPopper
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import Footer from "../components/Footer";
import "../styles/homepage.css";

const categories = [
  {
    name: "Stationery",
    image: "/images/Stationary.jpg.jpeg"
  },
  {
    name: "Electronics",
    image: "/images/Electronic items.jpg"
  },
  {
    name: "Bags",
    image: "/images/bags.jpg"
  },
  {
    name: "Books",
    image: "/images/programme fundamentals.jpg"
  }
];

const features = [
  {
    title: "Marketplace",
    description: "Shop stationery, electronics and more.",
    image: "/images/Electronic items.jpg",
    icon: ShoppingBag,
    link: "/marketplace"
  },
  {
    title: "Second-hand",
    description: "Discover affordable pre-loved items.",
    image: "/images/secondhand items.jpg",
    icon: Recycle,
    link: "/secondhand"
  },
  {
    title: "Student Services",
    description: "Find helpful services around campus.",
    image: "/images/services.jpg.jpeg",
    icon: GraduationCap,
    link: "/services"
  },
  {
    title: "Rentals",
    description: "Rent equipment when you need it.",
    image: "/images/rental-hero.jpg",
    icon: House,
    link: "/rentals"
  }
];

const services = [
  {
    title: "Printing & Binding",
    description: "Get assignments and notes printed.",
    image: "/images/printing.jpg.jpeg",
    icon: Printer
  },
  {
    title: "Photography",
    description: "Find photographers for special moments.",
    image: "/images/rental-hero.jpg",
    icon: Camera
  },
  {
    title: "Laptop Repair",
    description: "Find help with your technical problems.",
    image: "/images/laptop rapir.jpeg",
    icon: Wrench
  }
];

const steps = [
  {
    title: "Create an account",
    description: "Join the UNIORA community and explore the platform.",
    icon: Users,
    image: "/images/create an account.jpg.jpeg"
  },
  {
    title: "Discover what you need",
    description: "Browse products, services, rentals and event options.",
    icon: Search,
    image: "/images/discover what do you need.jpg.jpeg"
  },
  {
    title: "Connect and enjoy",
    description: "Make requests, shop and connect with other students.",
    icon: Heart,
    image: "/images/connect and enjoy.jpg.jpeg"
  }
];

function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, category_id")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(8);

      if (!active) return;

      if (!error) {
        setProducts(data || []);
      } else {
        console.error("Unable to load homepage products:", error.message);
      }

      setLoading(false);
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const query = searchText.trim();

    if (query) {
      navigate(`/marketplace?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/marketplace");
    }
  }

  function formatPrice(price) {
    return `LKR ${Number(price || 0).toLocaleString("en-LK")}`;
  }

  function getHomepageProductImage(product) {
    const name = product.name?.toLowerCase() || "";

    const localImages = [
      { match: ["stapler", "stepler"], image: "/images/market stepler.jpg" },
      { match: ["programming fundamentals"], image: "/images/programme fundamentals.jpg" },
      { match: ["desk organizer", "desk organiser"], image: "/images/desk organizer.jpg.jpeg" },
      { match: ["semester notebook", "notebook set"], image: "/images/Stationary.jpg.jpeg" },
      { match: ["premium pen", "pen collection"], image: "/images/market_premium pen collection.jpg" },
      { match: ["scientific calculator", "calculator"], image: "/images/market_calculator.jpg" },
      { match: ["laptop bag", "laptop bags", "laptop carry bag", "laptopbag"], image: "/images/market laptopbag.jpg" },
      { match: ["water bottle", "reusable bottle"], image: "/images/market_resuable water bottles.jpg" },
      { match: ["bag", "bags"], image: "/images/bags.jpg" }
    ];

    const localMatch = localImages.find(({ match }) =>
      match.some((keyword) => name.includes(keyword))
    );

    // Prefer the matching uploaded local asset over an older Supabase/external URL.
    return localMatch?.image || product.image_url;
  }

  return (
    <>
      <main className="home-page">

        {/* HERO SECTION */}
        <section className="home-hero">
          <div className="home-hero-overlay" />

          <div className="hero-content">
            <div className="hero-label">
              <Sparkles size={16} />
              YOUR CAMPUS, CONNECTED
            </div>

            <h1 className="animated-hero-title">
              <span className="hero-word hero-word-one">
                University life,
              </span>
              <br />
              <span className="hero-word hero-word-two">
                made <span className="hero-highlight">easier.</span>
              </span>
            </h1>

            <p className="hero-description">
              Buy, sell, rent, discover services and plan memorable events.
              Everything you need for university life, all in one place.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <Search size={21} />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                aria-label="Search UNIORA"
              />
              <button type="submit">Search</button>
            </form>

            <div className="hero-trust">
              <span><ShieldCheck size={17} /> Student-friendly platform</span>
              <span><Heart size={17} /> Built for campus life</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-photo" />
            <div className="hero-photo-tint" />

            <div className="hero-floating-card hero-card-top">
              <span className="floating-icon purple-icon">
                <ShoppingBag size={21} />
              </span>
              <span>
                <strong>Buy & Sell</strong>
                <small>Everything in one place</small>
              </span>
            </div>

            <div className="hero-floating-card hero-card-bottom">
              <span className="floating-icon pink-icon">
                <CalendarDays size={21} />
              </span>
              <span>
                <strong>Make memories</strong>
                <small>Plan your next event</small>
              </span>
            </div>

            <Sparkles className="hero-sparkle" size={25} />
          </div>
        </section>

        {/* FEATURE STRIP */}
        <section className="home-feature-strip">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                to={feature.link}
                className="feature-strip-card"
                key={feature.title}
                style={{ "--feature-photo": `url("${feature.image}")` }}
              >
                <div className="feature-card-photo" />
                <div className="feature-card-overlay" />

                <div className="feature-card-content">
                  <span className="feature-icon">
                    <Icon size={22} />
                  </span>

                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <span className="feature-action">
                      Explore <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        {/* CATEGORIES */}
        <section className="home-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">EXPLORE UNIORA</span>
              <h2>Find what you need</h2>
              <p>Explore popular categories and discover something useful.</p>
            </div>

            <Link to="/marketplace" className="section-link">
              View marketplace <ArrowRight size={17} />
            </Link>
          </div>

          <div className="home-category-grid">
            {categories.map((category) => (
              <Link
                to={`/marketplace?category=${encodeURIComponent(category.name)}`}
                className="home-category-card"
                key={category.name}
                style={{ backgroundImage: `url("${category.image}")` }}
              >
                <div className="category-card-overlay" />
                <div className="category-card-content">
                  <h3>{category.name}</h3>
                  <span className="category-explore">
                    Explore <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* LATEST PRODUCTS */}
        <section className="home-section home-products-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">FRESH FINDS</span>
              <h2>Latest from the marketplace</h2>
              <p>Discover products recently added to UNIORA.</p>
            </div>

            <Link to="/marketplace" className="section-link">
              Explore all products <ArrowRight size={17} />
            </Link>
          </div>

          {loading ? (
            <div className="home-loading">Loading products...</div>
          ) : products.length > 0 ? (
            <div className="home-product-grid">
              {products.map((product) => (
                <Link
                  to={`/product/${product.id}`}
                  className="home-product-card"
                  key={product.id}
                >
                  <div className="product-image-wrap">
                    {getHomepageProductImage(product) ? (
                      <div
                        className="product-background-image"
                        style={{
                          backgroundImage: `url("${getHomepageProductImage(product)}")`
                        }}
                      />
                    ) : (
                      <div className="product-no-image">
                        <span className="stapler-label">
                          Campus stationery
                        </span>
                      </div>
                    )}

                    <span className="product-tag">Campus pick</span>
                  </div>

                  <div className="home-product-info">
                    <h3>{product.name}</h3>
                    <div className="product-card-bottom">
                      <strong>{formatPrice(product.price)}</strong>
                      <span>View item <ArrowRight size={14} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="home-empty-products">
              <Package size={30} />
              <h3>No products available yet</h3>
              <p>New products will appear here when sellers publish them.</p>
              <Link to="/marketplace" className="home-primary-button">
                Visit marketplace <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>

        {/* SECOND-HAND */}
        <section className="home-secondhand-section">
          <div className="secondhand-image">
            <img
              src="/images/secondhand items.jpg"
              alt="Books and reusable student items"
              loading="lazy"
            />
            <div className="secondhand-image-overlay" />
            <div className="secondhand-image-note">
              <Recycle size={20} />
              Reuse. Resell. Repeat.
            </div>
          </div>

          <div className="secondhand-content">
            <span className="section-eyebrow">A SMARTER WAY TO SHOP</span>
            <h2>Pre-loved items,<br />new possibilities.</h2>

            <p>
              Find affordable second-hand products from other students.
              Sell items you no longer need and give them another chance
              to be useful.
            </p>

            <div className="secondhand-points">
              <span><ShieldCheck size={19} /> Student-friendly listings</span>
              <span><Heart size={19} /> Give items a second life</span>
            </div>

            <Link to="/secondhand" className="home-primary-button">
              Explore second-hand <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* SERVICES */}
        <section className="home-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">HELP WHEN YOU NEED IT</span>
              <h2>Student services</h2>
              <p>Discover useful services offered through the UNIORA community.</p>
            </div>

            <Link to="/services" className="section-link">
              Find all services <ArrowRight size={17} />
            </Link>
          </div>

          <div className="home-service-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  to="/services"
                  className="home-service-card"
                  key={service.title}
                  style={{ backgroundImage: `url("${service.image}")` }}
                >
                  <div className="service-card-overlay" />
                  <div className="service-card-content">
                    <span className="service-image-icon">
                      <Icon size={21} />
                    </span>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <span className="service-card-link">
                      Find a service <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* RENTALS AND EVENTS */}
        <section className="home-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">MORE TO DISCOVER</span>
              <h2>Make more happen</h2>
              <p>Find equipment and plan experiences with UNIORA.</p>
            </div>
          </div>

          <div className="home-discover-grid">
            <Link to="/rentals" className="discover-card rentals-discover">
              <div className="discover-overlay" />
              <div className="discover-content">
                <span><Camera size={18} /> RENTALS</span>
                <h3>Rent what you need.</h3>
                <p>Explore equipment and useful items available for rent.</p>
                <strong>Explore rentals <ArrowRight size={16} /></strong>
              </div>
            </Link>

            <Link to="/events" className="discover-card events-discover">
              <div className="discover-overlay" />
              <div className="discover-content">
                <span><PartyPopper size={18} /> EVENTS</span>
                <h3>Make every moment special.</h3>
                <p>Discover event services and plan memorable celebrations.</p>
                <strong>Explore events <ArrowRight size={16} /></strong>
              </div>
            </Link>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="home-how-section">
          <div className="section-heading centered-heading">
            <div>
              <span className="section-eyebrow">SIMPLE AND CONVENIENT</span>
              <h2>University life, made simple.</h2>
              <p>Getting started with UNIORA is easy.</p>
            </div>
          </div>

          <div className="how-steps-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  className="how-step"
                  key={step.title}
                  style={{ "--step-photo": `url("${step.image}")` }}
                >
                  <span className="how-step-number">
                    0{index + 1}
                  </span>

                  <span className="how-step-icon">
                    <Icon size={29} />
                  </span>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SELLER CTA */}
        <section className="home-seller-cta">
          <div className="seller-cta-text">
            <span className="section-eyebrow">JOIN THE COMMUNITY</span>
            <h2>Have something to offer?</h2>
            <p>
              Become part of UNIORA. Share your products, offer services
              and connect with students who are looking for what you provide.
            </p>

            <Link to="/login" className="home-cta-button">
              Get started <ArrowRight size={17} />
            </Link>
          </div>

          <div className="seller-cta-image" />
        </section>

      </main>

      {/* NEW DARK PURPLE FOOTER */}
      <Footer />
    </>
  );
}

export default Home;
