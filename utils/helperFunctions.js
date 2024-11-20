// Fiyat stringini sayıya dönüştürme
export function formatPrice(priceString) {
  // Fiyat içeriğinden harf olmayan karakterleri ayıklama ve noktaları/virgülleri sayıya uygun şekilde çevirme
  try {
    if (!priceString || typeof priceString !== 'string') {
      throw new Error("Fiyat formatı uygun değil");
    }
    // Fiyat dışındaki karakterleri temizle ve uygun formata çevir
    const cleanPriceString = priceString.replace(/[^0-9.,-]+/g, "").replace(",", ".");
    return parseFloat(cleanPriceString);
  } catch (error) {
    console.error("Fiyat formatlama hatası:", error.message);
    return NaN; // Eğer bir hata varsa geçersiz değer döndür
  }
}

// URL geçerli mi kontrolü
export function isValidImageUrl(url) {
  // Geçerli bir URL olup olmadığını ve uygun görsel uzantılarını kontrol et
  try {
    if (!url || typeof url !== 'string') {
      throw new Error("URL geçersiz veya boş");
    }
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return validExtensions.some(ext => url.toLowerCase().endsWith(ext));
  } catch (error) {
    console.error("Görsel URL geçerlilik kontrol hatası:", error.message);
    return false;
  }
}
