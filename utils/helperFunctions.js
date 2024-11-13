// Fiyat stringini sayıya dönüştürme
export function formatPrice(priceString) {
  return parseFloat(priceString.replace(/[^0-9.,-]+/g, "").replace(",", "."));
}

// URL geçerli mi kontrolü
export function isValidImageUrl(url) {
  return url && (url.endsWith(".jpg") || url.endsWith(".png") || url.endsWith(".jpeg"));
}
