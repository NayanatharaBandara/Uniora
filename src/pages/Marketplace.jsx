
import '../styles/marketplace.css'

function Marketplace() {
  return (
    <div className="marketplace-page">

      <section className="marketplace-header">
        <h1>Everyday Marketplace</h1>

        <p>
          Discover products and essentials
          for your university life.
        </p>
      </section>

      <section className="marketplace-content">
        <h2>Explore Products</h2>

        <div className="marketplace-empty">
          <h3>Products Coming Soon!</h3>

          <p>
            Our marketplace is getting ready.
            Check back soon to discover amazing products.
          </p>
        </div>
      </section>

    </div>
  )
}

export default Marketplace
