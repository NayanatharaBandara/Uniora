
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import '../styles/events.css'

const categoryCards = [
  {
    name: 'Sound & Lighting',
    description: 'Speakers, microphones, DJs and lighting equipment.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800'
  },
  {
    name: 'Photography & Videography',
    description: 'Capture your special moments professionally.',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'
  },
  {
    name: 'Event Transportation',
    description: 'Transportation for celebrations and group events.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'
  },
  {
    name: 'Projectors & Screens',
    description: 'Projectors, LED screens and presentation equipment.',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800'
  },
  {
    name: 'Gifts & Birthday Studio',
    description: 'Personalized gifts, cakes and decorations.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800'
  },
  {
    name: 'Event Packages',
    description: 'Packages for birthdays, parties and celebrations.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
  }
]

const defaultTasks = [
  'Choose an event date',
  'Set an event budget',
  'Select a venue',
  'Arrange decorations',
  'Order food and cake',
  'Arrange photography',
  'Send invitations'
]

const emptyForm = {
  name: '',
  category_id: '',
  description: '',
  price: ''
}

function Events() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [role, setRole] = useState('')
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [image, setImage] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [bookingService, setBookingService] = useState(null)
  const [eventDate, setEventDate] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')

  const [budget, setBudget] = useState(
    () => localStorage.getItem('uniora_event_budget') || ''
  )

  const [expenses, setExpenses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uniora_event_expenses')) || []
    } catch {
      return []
    }
  })

  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: ''
  })

  const [checklist, setChecklist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uniora_event_checklist')) ||
        defaultTasks.map(name => ({ name, done: false }))
    } catch {
      return defaultTasks.map(name => ({ name, done: false }))
    }
  })

  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    initializePage()
  }, [])

  useEffect(() => {
    localStorage.setItem('uniora_event_budget', budget)
  }, [budget])

  useEffect(() => {
    localStorage.setItem('uniora_event_expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('uniora_event_checklist', JSON.stringify(checklist))
  }, [checklist])

  async function initializePage() {
    setLoading(true)

    const { data: authData } = await supabase.auth.getUser()
    const currentUser = authData?.user || null
    setUser(currentUser)

    if (currentUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .maybeSingle()

      setRole(profile?.role || '')
    } else {
      setRole('')
    }

    await Promise.all([
      loadCategories(),
      loadServices(),
      currentUser ? loadRequests() : Promise.resolve()
    ])

    setLoading(false)
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, module')
      .eq('module', 'events')
      .order('id')

    if (!error) setCategories(data || [])
  }

  async function loadServices() {
    const { data, error } = await supabase
      .from('event_services')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      setNotice('Unable to load services: ' + error.message)
      return
    }

    setServices(data || [])
  }

  async function loadRequests() {
    const { data, error } = await supabase
      .from('event_service_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setNotice('Unable to load requests: ' + error.message)
      return
    }

    setRequests(data || [])
  }

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const category = categories.find(
        item => Number(item.id) === Number(service.category_id)
      )

      const matchesCategory =
        !selectedCategory || category?.name === selectedCategory

      const matchesSearch =
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        (service.description || '').toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [services, categories, selectedCategory, search])

  const myRequests = requests.filter(
    request => request.student_id === user?.id
  )

  const incomingRequests = requests.filter(
    request => request.provider_id === user?.id
  )

  const myServices = services.filter(
    service => service.provider_id === user?.id
  )

  const totalExpenses = expenses.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  )

  const parsedBudget = Number.parseFloat(budget)

  const remainingBudget =
    (Number.isFinite(parsedBudget) ? parsedBudget : 0) - totalExpenses

  const completedTasks = checklist.filter(task => task.done).length

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  function chooseCategory(name) {
    setSelectedCategory(name)
    setSearch('')
    scrollTo('event-services-list')
  }

  function showAllServices() {
    setSelectedCategory('')
    setSearch('')
    scrollTo('event-services-list')
  }

  function resetForm() {
    setForm(emptyForm)
    setImage(null)
    setEditingId(null)
  }

  function editService(service) {
    setEditingId(service.id)
    setForm({
      name: service.name || '',
      category_id: service.category_id || '',
      description: service.description || '',
      price: service.price ?? ''
    })
    setImage(null)
    scrollTo('event-provider-form')
  }

  async function publishService(e) {
    e.preventDefault()

    if (!user || role !== 'seller') {
      setNotice('Please log in using a seller account.')
      return
    }

    if (!form.name.trim() || !form.category_id || form.price === '') {
      setNotice('Please complete all required fields.')
      return
    }

    setSaving(true)
    setNotice('')

    let imageUrl = null

    if (image) {
      const extension = image.name.split('.').pop()
      const path = `events/${user.id}/${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, image)

      if (uploadError) {
        setNotice('Image upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      imageUrl = data.publicUrl
    }

    const details = {
      name: form.name.trim(),
      category_id: Number(form.category_id),
      description: form.description.trim(),
      price: Number(form.price),
      ...(imageUrl ? { image_url: imageUrl } : {})
    }

    const result = editingId
      ? await supabase
          .from('event_services')
          .update(details)
          .eq('id', editingId)
          .eq('provider_id', user.id)
      : await supabase
          .from('event_services')
          .insert({
            ...details,
            provider_id: user.id,
            status: 'active'
          })

    if (result.error) {
      setNotice('Could not save service: ' + result.error.message)
    } else {
      setNotice(editingId ? 'Service updated!' : 'Service published!')
      resetForm()
      await loadServices()
    }

    setSaving(false)
  }

  async function deleteService(id) {
    if (!window.confirm('Are you sure you want to delete this service?')) return

    const { error } = await supabase
      .from('event_services')
      .delete()
      .eq('id', id)
      .eq('provider_id', user.id)

    if (error) {
      setNotice('Could not delete service: ' + error.message)
    } else {
      setNotice('Service deleted successfully.')
      await loadServices()
    }
  }

  function startBooking(service) {
    if (!user) {
      navigate('/login')
      return
    }

    if (role !== 'student') {
      setNotice('Only student accounts can request event services.')
      return
    }

    setBookingService(service)
    setEventDate('')
    setBookingMessage('')
    scrollTo('event-booking-form')
  }

  async function submitBooking(e) {
    e.preventDefault()

    if (!user || !bookingService) return

    if (!eventDate) {
      setNotice('Please select your event date.')
      return
    }

    if (eventDate < new Date().toLocaleDateString('en-CA')) {
      setNotice('Please select a future date.')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('event_service_requests')
      .insert({
        event_service_id: bookingService.id,
        student_id: user.id,
        provider_id: bookingService.provider_id,
        event_date: eventDate,
        request_message: bookingMessage.trim(),
        status: 'pending'
      })

    if (error) {
      setNotice('Booking request failed: ' + error.message)
    } else {
      setNotice('Your booking request has been sent!')
      setBookingService(null)
      setEventDate('')
      setBookingMessage('')
      await loadRequests()
    }

    setSaving(false)
  }

  async function updateRequest(id, status) {
    const { error } = await supabase
      .from('event_service_requests')
      .update({ status })
      .eq('id', id)
      .eq('provider_id', user.id)

    if (error) {
      setNotice('Could not update request: ' + error.message)
    } else {
      setNotice('Booking request updated.')
      await loadRequests()
    }
  }

  function serviceName(id) {
    return services.find(item => Number(item.id) === Number(id))?.name ||
      'Event service'
  }

  function addExpense(e) {
    e.preventDefault()

    if (!newExpense.name.trim() || newExpense.amount === '') return

    const amount = Number(newExpense.amount)

    if (!Number.isFinite(amount) || amount < 0) {
      setNotice('Please enter a valid expense amount.')
      return
    }

    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        name: newExpense.name.trim(),
        amount
      }
    ])

    setNewExpense({ name: '', amount: '' })
  }

  function removeExpense(id) {
    setExpenses(expenses.filter(item => item.id !== id))
  }

  function addTask(e) {
    e.preventDefault()

    if (!newTask.trim()) return

    setChecklist([
      ...checklist,
      { name: newTask.trim(), done: false }
    ])

    setNewTask('')
  }

  function toggleTask(index) {
    setChecklist(checklist.map((task, i) =>
      i === index ? { ...task, done: !task.done } : task
    ))
  }

  function removeTask(index) {
    setChecklist(checklist.filter((_, i) => i !== index))
  }

  return (
    <div className="events-page">

      {/* HERO SECTION */}

      <section className="events-hero">
        <img
          src="/images/event-hero.jpg"
          alt="Event celebrations"
          className="events-hero-image"
        />

        <div className="events-hero-overlay"></div>

        <div className="events-hero-content">
          <span className="events-tag">UNIORA EVENT EXPERIENCES</span>

          <h1>
            Make Every Moment
            <span> Special.</span>
          </h1>

          <p>
            Discover event services, organize celebrations, find personalized
            gifts and create unforgettable memories.
          </p>

          <button
            className="events-main-btn"
            onClick={() => scrollTo('event-categories')}
          >
            Explore Event Services →
          </button>
        </div>
      </section>

      {/* INTRODUCTION */}

      <section className="events-intro">
        <span>PLAN • CELEBRATE • REMEMBER</span>
        <h2>Everything for Your Special Events</h2>
        <p>
          Your one-stop place for event services, birthday arrangements
          and celebration planning.
        </p>
      </section>

      {/* EVENT CATEGORIES */}

      <section className="events-category-section" id="event-categories">
        <div className="events-section-heading">
          <div>
            <span>EXPLORE OUR SERVICES</span>
            <h2>What Are You Planning?</h2>
          </div>
        </div>

        <div className="events-category-grid">
          {categoryCards.map(category => (
            <article className="events-category-card" key={category.name}>
              <div className="events-card-image">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                />
                <span>{category.name.toUpperCase()}</span>
              </div>

              <div className="events-card-info">
                <h3>{category.name}</h3>
                <p>{category.description}</p>

                <button
                  className="events-card-arrow"
                  onClick={() => chooseCategory(category.name)}
                >
                  Explore →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* AVAILABLE EVENT SERVICES */}

      <section className="event-services-list" id="event-services-list">
        <div className="events-section-heading">
          <div>
            <span>FIND WHAT YOU NEED</span>
            <h2>{selectedCategory || 'Available Event Services'}</h2>
            <p>Services published by UNIORA providers.</p>
          </div>

          {selectedCategory && (
            <button className="events-view-all" onClick={showAllServices}>
              View All
            </button>
          )}
        </div>

        <div className="events-search">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search event services..."
          />
          <button onClick={showAllServices}>Clear</button>
        </div>

        {loading ? (
          <div className="events-empty">Loading event services...</div>
        ) : filteredServices.length === 0 ? (
          <div className="events-empty">
            <h3>No services available yet</h3>
            <p>Try another category or check back later.</p>
          </div>
        ) : (
          <div className="event-service-grid">
            {filteredServices.map(service => (
              <article className="event-service-card" key={service.id}>
                <div className="event-service-image">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="event-service-no-image">
                      <span>UNIORA</span>
                      <small>{service.name}</small>
                    </div>
                  )}
                </div>

                <div className="event-service-info">
                  <h3>{service.name}</h3>

                  <p>
                    {service.description ||
                      'Contact the provider for more details.'}
                  </p>

                  <div className="event-service-bottom">
                    <strong>
                      {Number(service.price) > 0
                        ? `LKR ${Number(service.price).toLocaleString()}`
                        : 'Contact for price'}
                    </strong>
                    <span>Available</span>
                  </div>

                  {role === 'student' && (
                    <button
                      className="event-book-button"
                      onClick={() => startBooking(service)}
                    >
                      Request Booking
                    </button>
                  )}

                  {role === 'seller' && service.provider_id === user?.id && (
                    <div className="event-owner-actions">
                      <button onClick={() => editService(service)}>Edit</button>
                      <button onClick={() => deleteService(service.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SELLER SERVICE FORM */}

      {role === 'seller' && (
        <section className="event-provider-section" id="event-provider-form">
          <div className="events-section-heading">
            <div>
              <span>PROVIDER DASHBOARD</span>
              <h2>
                {editingId ? 'Edit Event Service' : 'Publish an Event Service'}
              </h2>
              <p>Publish your services for UNIORA students.</p>
            </div>
          </div>

          <form className="event-provider-form" onSubmit={publishService}>
            <div className="event-form-grid">
              <div className="event-form-field">
                <label>Service Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Example: Birthday Photography"
                  required
                />
              </div>

              <div className="event-form-field">
                <label>Category *</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm({
                    ...form,
                    category_id: e.target.value
                  })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="event-form-field">
                <label>Price (LKR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="Enter price"
                  required
                />
              </div>

              <div className="event-form-field">
                <label>Service Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImage(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="event-form-field">
              <label>Description</label>
              <textarea
                rows="4"
                value={form.description}
                onChange={e => setForm({
                  ...form,
                  description: e.target.value
                })}
                placeholder="Describe your service..."
              />
            </div>

            <div className="event-form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Service'
                    : 'Publish Service'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="event-cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="events-my-services">
            <h3>My Published Services ({myServices.length})</h3>

            {myServices.map(service => (
              <div className="events-my-service-row" key={service.id}>
                <span>{service.name}</span>
                <button onClick={() => editService(service)}>Edit</button>
                <button onClick={() => deleteService(service.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STUDENT BOOKING FORM */}

      {bookingService && (
        <section className="event-booking-section" id="event-booking-form">
          <h2>Request a Booking</h2>
          <p>
            Selected service: <strong>{bookingService.name}</strong>
          </p>

          <form className="event-provider-form" onSubmit={submitBooking}>
            <div className="event-form-field">
              <label>Event Date *</label>
              <input
                type="date"
                min={new Date().toLocaleDateString('en-CA')}
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                required
              />
            </div>

            <div className="event-form-field">
              <label>Your Requirements</label>
              <textarea
                rows="4"
                value={bookingMessage}
                onChange={e => setBookingMessage(e.target.value)}
                placeholder="Tell the provider about your event..."
              />
            </div>

            <div className="event-form-actions">
              <button type="submit" disabled={saving}>
                {saving ? 'Sending...' : 'Send Booking Request'}
              </button>

              <button
                type="button"
                className="event-cancel-btn"
                onClick={() => setBookingService(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* STUDENT BOOKING REQUESTS */}

      {role === 'student' && (
        <section className="event-requests-section">
          <span className="events-small-label">STUDENT DASHBOARD</span>
          <h2>My Event Booking Requests</h2>

          {myRequests.length === 0 ? (
            <p>You haven't sent any booking requests yet.</p>
          ) : (
            myRequests.map(request => (
              <div className="event-request-card" key={request.id}>
                <div>
                  <h3>{serviceName(request.event_service_id)}</h3>
                  <p>Event date: {request.event_date || 'Not specified'}</p>
                  <p>{request.request_message || 'No additional message'}</p>
                </div>

                <span className={`request-status ${request.status}`}>
                  {request.status}
                </span>
              </div>
            ))
          )}
        </section>
      )}

      {/* SELLER INCOMING REQUESTS */}

      {role === 'seller' && (
        <section className="event-requests-section">
          <span className="events-small-label">PROVIDER DASHBOARD</span>
          <h2>Incoming Booking Requests</h2>

          {incomingRequests.length === 0 ? (
            <p>You don't have any booking requests yet.</p>
          ) : (
            incomingRequests.map(request => (
              <div className="event-request-card" key={request.id}>
                <div>
                  <h3>{serviceName(request.event_service_id)}</h3>
                  <p>Event date: {request.event_date || 'Not specified'}</p>
                  <p>Student ID: {request.student_id}</p>
                  <p>{request.request_message || 'No additional message'}</p>
                </div>

                <div className="event-request-actions">
                  <span className={`request-status ${request.status}`}>
                    {request.status}
                  </span>

                  {request.status === 'pending' && (
                    <>
                      <button onClick={() => updateRequest(request.id, 'accepted')}>
                        Accept
                      </button>
                      <button
                        className="reject-request"
                        onClick={() => updateRequest(request.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {request.status === 'accepted' && (
                    <button onClick={() => updateRequest(request.id, 'completed')}>
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* MIDDLE PROMOTIONAL SECTION */}

      <section className="event-middle-promo">
        <div className="event-middle-overlay"></div>

        <div className="event-middle-content">
          <span>CELEBRATE YOUR WAY</span>
          <h2>Bring Your Ideas to Life.</h2>
          <p>
            From campus celebrations to unforgettable birthdays, find the
            services and support you need to make every event special.
          </p>
          <button onClick={() => scrollTo('birthday-tools')}>
            Start Planning →
          </button>
        </div>
      </section>

      {/* BIRTHDAY STUDIO */}

      <section className="birthday-studio" id="birthday-studio">
        <div className="birthday-studio-background"></div>
        <div className="birthday-studio-overlay"></div>

        <div className="birthday-studio-content">
          <span className="birthday-eyebrow">
            ✦ MAKE THEIR DAY EXTRA SPECIAL
          </span>

          <h2>
            A Celebration
            <span> Worth Remembering.</span>
          </h2>

          <p>
            From beautiful birthday cakes to thoughtful gifts and creative
            decorations, bring your celebration ideas to life with UNIORA.
          </p>

          <div className="birthday-feature-grid">
            <div className="birthday-feature">
              <span>🎂</span>
              <div>
                <h3>Birthday Cakes</h3>
                <p>Find cakes for every celebration.</p>
              </div>
            </div>

            <div className="birthday-feature">
              <span>🎁</span>
              <div>
                <h3>Personalized Gifts</h3>
                <p>Make your gifts more meaningful.</p>
              </div>
            </div>

            <div className="birthday-feature">
              <span>🎈</span>
              <div>
                <h3>Party Decorations</h3>
                <p>Create a beautiful party atmosphere.</p>
              </div>
            </div>

            <div className="birthday-feature">
              <span>✨</span>
              <div>
                <h3>Surprise Arrangements</h3>
                <p>Plan a memorable surprise.</p>
              </div>
            </div>
          </div>

          <div className="birthday-studio-actions">
            <button
              className="birthday-studio-btn"
              onClick={() => scrollTo('birthday-tools')}
            >
              Plan Your Celebration <span>→</span>
            </button>

            <button
              className="birthday-secondary-btn"
              onClick={() => scrollTo('event-services-list')}
            >
              Explore Event Services
            </button>
          </div>

          <div className="birthday-bottom-note">
            <span>✦</span> Little details. Beautiful memories.
          </div>
        </div>
      </section>

      {/* INTERACTIVE EVENT PLANNER */}

      <section className="birthday-tools" id="birthday-tools">
        <div className="events-section-heading">
          <div>
            <span>PLAN YOUR CELEBRATION</span>
            <h2>Birthday & Event Planner</h2>
            <p>
              Organize your budget and keep track of your preparations.
            </p>
          </div>
        </div>

        <div className="birthday-tools-grid">

          {/* BUDGET PLANNER */}

          <div className="birthday-tool-card">
            <h3>Event Budget Planner</h3>

            <label>Estimated Budget (LKR)</label>
            <input
              type="number"
              min="0"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="Enter your budget"
            />

            <form className="event-expense-form" onSubmit={addExpense}>
              <input
                value={newExpense.name}
                onChange={e => setNewExpense({
                  ...newExpense,
                  name: e.target.value
                })}
                placeholder="Expense name"
                required
              />

              <input
                type="number"
                min="0"
                value={newExpense.amount}
                onChange={e => setNewExpense({
                  ...newExpense,
                  amount: e.target.value
                })}
                placeholder="Amount"
                required
              />

              <button type="submit">Add Expense</button>
            </form>

            <div className="event-budget-summary">
              <p>
                Total expenses:
                <strong> LKR {totalExpenses.toLocaleString()}</strong>
              </p>

              <p>
                Remaining budget:
                <strong> LKR {remainingBudget.toLocaleString()}</strong>
              </p>
            </div>

            {expenses.map(item => (
              <div className="event-expense-row" key={item.id}>
                <span>{item.name}</span>
                <strong>LKR {item.amount.toLocaleString()}</strong>

                <button
                  type="button"
                  onClick={() => removeExpense(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* EVENT CHECKLIST */}

          <div className="birthday-tool-card">
            <h3>Event Checklist</h3>

            <form className="event-task-form" onSubmit={addTask}>
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                required
              />

              <button type="submit">Add</button>
            </form>

            <div className="event-checklist">
              {checklist.map((task, index) => (
                <div className="event-checklist-row" key={index}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(index)}
                    />

                    <span className={task.done ? 'task-done' : ''}>
                      {task.name}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    aria-label={`Remove ${task.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <p className="event-task-progress">
              {completedTasks} of {checklist.length} tasks completed
            </p>
          </div>
        </div>
      </section>

      {/* STATUS MESSAGE */}

      {notice && (
        <div className="events-global-message">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Close message">
            ×
          </button>
        </div>
      )}

      {/* BOTTOM CTA */}

      <section className="events-bottom">
        <h2>Every Celebration Deserves Something Special.</h2>
        <p>Plan it, organize it and make memories with UNIORA.</p>

        <button onClick={() => scrollTo('birthday-tools')}>
          Start Planning →
        </button>
      </section>
    </div>
  )
}

export default Events
