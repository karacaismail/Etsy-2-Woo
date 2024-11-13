export function validateProductData(data) {
  const { title, price, images } = data;
  if (!title) throw new Error("Ürün başlığı bulunamadı.");
  if (!price || isNaN(parseFloat(price))) throw new Error("Geçerli bir fiyat bulunamadı.");
  if (!images || images.length === 0) throw new Error("En az bir ürün görseli bulunmalı.");
  return true;
}
