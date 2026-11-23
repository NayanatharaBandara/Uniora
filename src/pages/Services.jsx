
import { useEffect, useMemo, useState } from "react";
import {
  Search, ArrowRight, Printer, Camera, Wrench, GraduationCap,
  Plus, X, Upload, Trash2, Pencil, CalendarDays, CheckCircle,
  Clock, XCircle, BriefcaseBusiness, Sparkles
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "../styles/services.css";

const categoryImages = {
  "Academic Support": "/images/programme fundamentals.jpg",
  "Laptop Repair": "/images/laptop rapir.jpeg",
  "Other Services": "/images/Other Services.png",
  "Photography": "/images/photography.jpg.jpeg",
  "Printing & Binding": "/images/printing.jpg.jpeg",
};

const serviceImages = {
  "Academic Support": "/images/programme fundamentals.jpg",
  "Laptop Repair": "/images/laptop rapir.jpeg",
  "Other Services": "/images/Other Services.png",
  "Photography": "/images/photography.jpg.jpeg",
  "Printing & Binding": "/images/printing.jpg.jpeg",
};

const categoryIcons = {
  "Academic Support": GraduationCap,
  "Laptop Repair": Wrench,
  "Other Services": BriefcaseBusiness,
  "Photography": Camera,
  "Printing & Binding": Printer,
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
  });

  const isSeller = profile?.role === "seller";

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data: authData } = await supabase.auth.getUser();
      if (!mounted) return;

      const currentUser = authData?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (mounted) setProfile(data);
      }

      await loadPage(currentUser, mounted);
    }

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (mounted) setProfile(data);
        } else {
          setProfile(null);
        }

        await loadPage(currentUser, mounted);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadPage(currentUser = user, mounted = true) {
    setLoading(true);

    const [serviceResult, categoryResult] = await Promise.all([
      supabase
        .from("services")
        .select("*, categories(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false }),

      supabase
        .from("categories")
        .select("id, name")
        .eq("module", "services")
        .order("name"),
    ]);

    if (!mounted) return;

    if (serviceResult.error) {
      console.error("Services loading error:", serviceResult.error);
    }

    const serviceRows = (serviceResult.data || []).map((item) => ({
      ...item,
      category_name: item.categories?.name || "Other Services",
    }));

    setServices(serviceRows);
    setCategories(categoryResult.data || []);

    if (currentUser) {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, services(name)")
        .or(
          `customer_id.eq.${currentUser.id},provider_id.eq.${currentUser.id}`
        )
        .order("requested_at", { ascending: false });

      if (!error && mounted) setRequests(data || []);
    } else if (mounted) {
      setRequests([]);
    }

    if (mounted) setLoading(false);
  }

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name?.toLowerCase().includes(search.toLowerCase()) ||
        service.description?.toLowerCase().includes(search.toLowerCase()) ||
        service.category_name?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        service.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, search, selectedCategory]);

  const myServices = services.filter(
    (service) => service.provider_id === user?.id
  );

  const myRequests = requests.filter(
    (request) => request.customer_id === user?.id
  );

  const incomingRequests = requests.filter(
    (request) => request.provider_id === user?.id
  );

  function resetForm() {
    setForm({
      name: "",
      description: "",
      price: "",
      category_id: "",
    });
    setImageFile(null);
    setPreview("");
    setEditingId(null);
    setFormOpen(false);
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
    setPreview(URL.createObjectURL(file));
  }

  async function saveService(event) {
    event.preventDefault();

    if (!user) {
      alert("Please log in to publish a service.");
      return;
    }

    if (!isSeller) {
      alert("Only service provider accounts can publish services.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      form.price === "" ||
      !form.category_id
    ) {
      alert("Please complete all required fields.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = null;

      if (editingId) {
        const existing = services.find((item) => item.id === editingId);
        imageUrl = existing?.image_url || null;
      }

      if (imageFile) {
        const extension = imageFile.name.split(".").pop();
        const filePath = `services/${user.id}/${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = publicData.publicUrl;
      }

      const serviceData = {
        provider_id: user.id,
        category_id: Number(form.category_id),
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image_url: imageUrl,
        status: "active",
      };

      const result = editingId
        ? await supabase
            .from("services")
            .update(serviceData)
            .eq("id", editingId)
            .eq("provider_id", user.id)
        : await supabase.from("services").insert(serviceData);

      if (result.error) throw result.error;

      alert(
        editingId
          ? "Service updated successfully!"
          : "Your service has been published!"
      );

      resetForm();
      await loadPage(user);
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to save the service.");
    } finally {
      setSaving(false);
    }
  }

  function editService(service) {
    setEditingId(service.id);
    setForm({
      name: service.name || "",
      description: service.description || "",
      price: String(service.price ?? ""),
      category_id: String(service.category_id || ""),
    });
    setPreview(service.image_url || "");
    setImageFile(null);
    setFormOpen(true);
    setActiveTab("my-services");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteService(serviceId) {
    if (!window.confirm("Delete this service listing?")) return;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)
      .eq("provider_id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPage(user);
  }

  async function requestService(service) {
    if (!user) {
      alert("Please log in to request a service.");
      return;
    }

    if (profile?.role !== "student") {
      alert("Only student accounts can request services.");
      return;
    }

    if (service.provider_id === user.id) {
      alert("You cannot request your own service.");
      return;
    }

    const message = window.prompt(
      `Send a request for "${service.name}".\n\nDescribe what you need:`
    );

    if (message === null) return;

    if (!message.trim()) {
      alert("Please enter a short message.");
      return;
    }

    const { error } = await supabase
      .from("service_requests")
      .insert({
        service_id: service.id,
        customer_id: user.id,
        provider_id: service.provider_id,
        request_message: message.trim(),
        status: "pending",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Your service request has been sent!");
    await loadPage(user);
    setActiveTab("my-requests");
  }

  async function updateRequestStatus(requestId, status) {
    const { error } = await supabase
      .from("service_requests")
      .update({ status })
      .eq("id", requestId)
      .eq("provider_id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPage(user);
  }

  function ServiceCard({ service, owner = false }) {
    const fallbackImage =
      serviceImages[service.category_name] || serviceImages["Other Services"];

    return (
      <article className="service-card">
        <div className="service-card-image">
          <img
            src={service.image_url || fallbackImage}
            alt={service.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />

          <span className="service-category-label">
            {service.category_name}
          </span>
        </div>

        <div className="service-card-body">
          <h3>{service.name}</h3>
          <p className="service-description">{service.description}</p>

          <div className="service-card-bottom">
            <strong>
              LKR{" "}
              {Number(service.price || 0).toLocaleString("en-LK", {
                minimumFractionDigits: 2,
              })}
            </strong>
            <span>
              <BriefcaseBusiness size={15} /> Student service
            </span>
          </div>

          {owner ? (
            <div className="service-owner-actions">
              <button onClick={() => editService(service)}>
                <Pencil size={15} /> Edit
              </button>
              <button
                className="delete"
                onClick={() => deleteService(service.id)}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          ) : (
            <button
              className="service-request-button"
              onClick={() => requestService(service)}
            >
              Request service <ArrowRight size={17} />
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <main className="services-page">
      {/* HERO */}
      <section className="services-hero">
        <div className="services-hero-content">
          <span className="services-eyebrow">
            <Sparkles size={16} /> SUPPORT FOR STUDENT LIFE
          </span>

          <h1>
            The right help.
            <br />
            <span>Right on campus.</span>
          </h1>

          <p>
            Discover useful services offered by the UNIORA community.
            From printing and repairs to photography and academic support,
            find the help you need in one place.
          </p>

          <button
            className="services-hero-button"
            onClick={() =>
              document
                .getElementById("services-collection")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore services <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* INTRO */}
      <section className="services-intro">
        <span className="services-eyebrow">UNIORA STUDENT SERVICES</span>
        <h2>What can we help you with?</h2>
        <p>
          Connect with students and service providers who can make your
          university life easier.
        </p>
      </section>

      {/* CATEGORY CARDS WITH YOUR LOCAL IMAGES */}
      <section className="services-category-section">
        <div className="services-category-grid">
          {categories.map((category) => {
            const Icon =
              categoryIcons[category.name] || BriefcaseBusiness;

            return (
              <button
                key={category.id}
                className={`services-category-card ${
                  selectedCategory === category.name ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedCategory(category.name);
                  document
                    .getElementById("services-collection")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="services-category-photo">
                  <img
                    src={
                      categoryImages[category.name] ||
                      categoryImages["Other Services"]
                    }
                    alt={category.name}
                    loading="lazy"
                  />
                </div>

                <div className="services-category-details">
                  <span className="services-category-icon">
                    <Icon size={21} />
                  </span>

                  <strong>{category.name}</strong>

                  <span className="services-category-link">
                    Explore services <ArrowRight size={16} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SERVICE LISTINGS */}
      <section
        className="services-listings-section"
        id="services-collection"
      >
        <div className="services-listings-inner">
          <div className="services-section-heading">
            <div>
              <span className="services-eyebrow">FIND YOUR SUPPORT</span>
              <h2>Explore available services</h2>
              <p>Find the right service for your next task.</p>
            </div>

            {isSeller && (
              <button
                className="services-add-button"
                onClick={() => {
                  resetForm();
                  setFormOpen(true);
                }}
              >
                <Plus size={18} /> Add a service
              </button>
            )}
          </div>

          {/* TABS */}
          <div className="services-tabs">
            <button
              className={activeTab === "browse" ? "active" : ""}
              onClick={() => setActiveTab("browse")}
            >
              All services
            </button>

            {user && (
              <>
                <button
                  className={activeTab === "my-requests" ? "active" : ""}
                  onClick={() => setActiveTab("my-requests")}
                >
                  My requests
                </button>

                {isSeller && (
                  <>
                    <button
                      className={activeTab === "my-services" ? "active" : ""}
                      onClick={() => setActiveTab("my-services")}
                    >
                      My services
                    </button>

                    <button
                      className={activeTab === "incoming" ? "active" : ""}
                      onClick={() => setActiveTab("incoming")}
                    >
                      Incoming requests
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* BROWSE SERVICES */}
          {activeTab === "browse" && (
            <>
              <div className="services-filter-bar">
                <div className="services-search">
                  <Search size={19} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search printing, repairs, photography..."
                  />
                  {search && (
                    <button onClick={() => setSearch("")}>
                      <X size={17} />
                    </button>
                  )}
                </div>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                >
                  <option value="All">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="services-empty">
                  <span>Loading services...</span>
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="services-grid">
                  {filteredServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="services-empty">
                  <BriefcaseBusiness size={35} />
                  <h3>No services found</h3>
                  <p>
                    Try another search or select a different category.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}

          {/* MY REQUESTS */}
          {activeTab === "my-requests" && (
            <div className="services-requests-list">
              {myRequests.length === 0 ? (
                <div className="services-empty">
                  <CalendarDays size={35} />
                  <h3>No service requests yet</h3>
                  <p>Your requests will appear here.</p>
                  <button onClick={() => setActiveTab("browse")}>
                    Browse services
                  </button>
                </div>
              ) : (
                myRequests.map((request) => (
                  <div className="service-request-row" key={request.id}>
                    <div>
                      <h3>
                        {request.services?.name || "Service request"}
                      </h3>
                      <p>{request.request_message}</p>
                      <small>
                        {new Date(request.requested_at).toLocaleDateString()}
                      </small>
                    </div>
                    <span className={`service-status ${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MY SERVICES */}
          {activeTab === "my-services" && (
            <>
              {formOpen && (
                <form className="services-form" onSubmit={saveService}>
                  <div className="services-form-heading">
                    <div>
                      <span className="services-eyebrow">
                        PROVIDER PANEL
                      </span>
                      <h3>
                        {editingId ? "Edit service" : "Publish a service"}
                      </h3>
                    </div>
                    <button type="button" onClick={resetForm}>
                      <X />
                    </button>
                  </div>

                  <label>Service name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Assignment Printing"
                  />

                  <label>Description *</label>
                  <textarea
                    required
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe the service you provide..."
                    rows={4}
                  />

                  <div className="services-form-two">
                    <div>
                      <label>Price (LKR) *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(event) =>
                          setForm({ ...form, price: event.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label>Category *</label>
                      <select
                        required
                        value={form.category_id}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            category_id: event.target.value,
                          })
                        }
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label>Service photo (optional)</label>
                  <label className="services-upload-area">
                    <Upload size={23} />
                    <span>
                      {imageFile ? imageFile.name : "Choose an image"}
                    </span>
                    <small>JPG or PNG, maximum 5 MB</small>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>

                  {preview && (
                    <div className="services-upload-preview">
                      <img src={preview} alt="Service preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setPreview("");
                        }}
                      >
                        <X size={16} /> Remove photo
                      </button>
                    </div>
                  )}

                  <div className="services-form-actions">
                    <button type="button" onClick={resetForm}>
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}>
                      {saving
                        ? "Saving..."
                        : editingId
                          ? "Save changes"
                          : "Publish service"}
                    </button>
                  </div>
                </form>
              )}

              {!formOpen && (
                <div className="services-provider-heading">
                  <div>
                    <h3>Your published services</h3>
                    <p>Manage the services you offer to students.</p>
                  </div>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="services-add-button"
                  >
                    <Plus size={18} /> Add a service
                  </button>
                </div>
              )}

              {myServices.length > 0 ? (
                <div className="services-grid">
                  {myServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      owner
                    />
                  ))}
                </div>
              ) : (
                <div className="services-empty">
                  <BriefcaseBusiness size={35} />
                  <h3>You haven't published any services</h3>
                  <p>Start by adding your first service listing.</p>
                  {!formOpen && (
                    <button onClick={() => setFormOpen(true)}>
                      Publish a service
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* INCOMING REQUESTS */}
          {activeTab === "incoming" && (
            <div className="services-requests-list">
              {incomingRequests.length === 0 ? (
                <div className="services-empty">
                  <Clock size={35} />
                  <h3>No incoming requests</h3>
                  <p>
                    Student requests for your services will appear here.
                  </p>
                </div>
              ) : (
                incomingRequests.map((request) => (
                  <div className="service-request-row" key={request.id}>
                    <div>
                      <h3>
                        {request.services?.name || "Service request"}
                      </h3>
                      <p>{request.request_message}</p>
                      <small>
                        {new Date(request.requested_at).toLocaleDateString()}
                      </small>
                    </div>

                    <div className="service-request-controls">
                      <span className={`service-status ${request.status}`}>
                        {request.status}
                      </span>

                      {request.status === "pending" && (
                        <>
                          <button
                            className="accept"
                            onClick={() =>
                              updateRequestStatus(request.id, "accepted")
                            }
                          >
                            <CheckCircle size={15} /> Accept
                          </button>
                          <button
                            className="reject"
                            onClick={() =>
                              updateRequestStatus(request.id, "rejected")
                            }
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </>
                      )}

                      {request.status === "accepted" && (
                        <button
                          className="accept"
                          onClick={() =>
                            updateRequestStatus(request.id, "completed")
                          }
                        >
                          <CheckCircle size={15} /> Mark completed
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="services-bottom-cta">
        <div>
          <span className="services-eyebrow">BE PART OF UNIORA</span>
          <h2>Have a skill to share?</h2>
          <p>
            Offer your services and connect with students who need your help.
          </p>
        </div>
        <a href="/account">
          Get started <ArrowRight size={18} />
        </a>
      </section>
    </main>
  );
}
