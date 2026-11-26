const fallbackImages = {
  stationery: "/images/Stationary.jpg.jpeg",
  electronics: "/images/Electronic items.jpg",
  books: "/images/programme fundamentals.jpg",
};

export function getProductDisplayImage(product = {}) {
  const name = String(product.name || "").toLowerCase();
  const description = String(product.description || "").toLowerCase();
  const text = name + " " + description;

  if (text.includes("laptop") && text.includes("bag")) return "/images/laptop-bags.jpg";
  if (text.includes("stapler") || text.includes("stepler")) return "/images/market stepler.jpg";
  if (text.includes("programming fundamentals")) return "/images/market_programming fundamentals.jpg";
  if (text.includes("premium pen") || text.includes("pen collection")) return "/images/market_premium pen collection.jpg";
  if (text.includes("calculator")) return "/images/market_calculator.jpg";
  if (text.includes("water bottle") || text.includes("reusable bottle")) return "/images/market_resuable water bottles.jpg";
  if (text.includes("backpack") || text.includes("bag")) return "/images/bags.jpg";
  if (text.includes("book") || text.includes("notes")) return fallbackImages.books;
  if (text.includes("laptop") || text.includes("headphone") || text.includes("electronic")) return fallbackImages.electronics;

  return product.image_url || fallbackImages.stationery;
}

export default getProductDisplayImage;
