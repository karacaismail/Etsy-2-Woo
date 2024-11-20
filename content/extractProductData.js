import { formatPrice, isValidImageUrl } from '../utils/helperFunctions.js';

async function extractProductData() {
  console.log("Ürün verisi çekme işlemi başlatıldı");

  try {
    // Sayfa tamamen yüklenene kadar kısa bir süre bekleyelim
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Ürün başlığını al
    const titleElement = document.querySelector('h1[data-buy-box-listing-title]');
    const title = titleElement ? titleElement.innerText : "Başlık bulunamadı";
    console.log("Ürün başlığı:", title);

    // Ürün fiyatını al ve formatla
    const priceElement = document.querySelector('div[data-selector="price-only"] p');
    let price = priceElement ? priceElement.innerText : "Fiyat bulunamadı";
    price = formatPrice(price);  // Yardımcı fonksiyon kullanarak fiyatı formatla
    console.log("Formatlanmış ürün fiyatı:", price);

    // Ürün açıklamasını al
    const descriptionElement = document.querySelector('p[data-product-details-description-text-content]');
    const description = descriptionElement ? descriptionElement.innerText : "Açıklama bulunamadı";
    console.log("Ürün açıklaması:", description);

    // Ürün görsellerini al
    const imageElements = document.querySelectorAll('ul.carousel-pane-list img');
    const images = imageElements.length > 0 ? Array.from(imageElements).map(img => img.src).filter(isValidImageUrl) : [];
    console.log("Ürün görselleri:", images);

    // Video URL'lerini al - Tüm DOM üzerinde .mp4 araması yaparak
    const allSources = document.querySelectorAll('source, video');
    const videoUrls = Array.from(allSources)
      .map(source => source.src)
      .filter(src => src && src.endsWith('.mp4'));
    console.log("Ürün videoları:", videoUrls);

    // Medya dosyalarını birleştir
    const mediaFiles = [...images, ...videoUrls];
    console.log("Ürün medya dosyaları:", mediaFiles);

    // Ürün varyant seçeneklerini al
    const optionElements = document.querySelectorAll('#variation-selector-0 option');
    const options = optionElements.length > 1 ? Array.from(optionElements)
      .map(option => option.innerText)
      .filter(option => option !== 'Select an option') : ["Varyant seçenekleri bulunamadı"];
    console.log("Varyant seçenekleri:", options);

    return { title, price, description, images: mediaFiles, options };
  } catch (error) {
    console.error("Veri çekme hatası:", error.message);
    return null;
  }
}

export default extractProductData;
