export function validateProductData(data) {
  const { title, price, images, description, options } = data;

  if (!title) {
    throw new Error("Ürün başlığı bulunamadı. Lütfen ürünün başlığını ekleyin.");
  }

  if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    throw new Error("Geçerli bir fiyat bulunamadı. Fiyat sıfırdan büyük ve geçerli bir sayı olmalıdır.");
  }

  if (!images || images.length === 0) {
    throw new Error("En az bir ürün görseli bulunmalı. Ürüne ait en az bir görsel ekleyin.");
  }

  // Opsiyonel doğrulama: Açıklama
  if (!description || description.trim() === "") {
    console.warn("Ürün açıklaması boş. Daha iyi bir müşteri deneyimi için açıklama eklenmesi önerilir.");
  }

  // Opsiyonel doğrulama: Varyant seçenekleri
  if (!options || options.length === 0) {
    console.warn("Ürün varyant seçenekleri bulunamadı. Eğer ürünün farklı varyantları varsa, lütfen bunları ekleyin.");
  }

  // Görsel URL'lerinin geçerliliğini kontrol et
  const invalidImages = images.filter(url => !url || typeof url !== 'string' || !url.startsWith('http'));
  if (invalidImages.length > 0) {
    throw new Error("Bazı görsel URL'leri geçersiz. Lütfen geçerli URL'ler kullanın.");
  }

  return true;
}
