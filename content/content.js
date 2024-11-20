// content.js

function extractProductData() {
  console.log("Ürün verisi çekme işlemi başlatıldı");

  try {
    // Ürün başlığını al
    const titleElement = document.querySelector('h1[data-buy-box-listing-title]');
    const title = titleElement ? titleElement.innerText : "Başlık bulunamadı";
    console.log("Ürün başlığı:", title);

    // Ürün fiyatını al ve formatla
    const priceElement = document.querySelector('div[data-selector="price-only"] p');
    let price = priceElement ? priceElement.innerText : "Fiyat bulunamadı";
    price = price.replace(/[^0-9,.]/g, '').replace(',', '.'); // Fiyatı uygun formata çevir
    console.log("Formatlanmış ürün fiyatı:", price);

    // Ürün açıklamasını al
    const descriptionElement = document.querySelector('p[data-product-details-description-text-content]');
    const description = descriptionElement ? descriptionElement.innerText : "Açıklama bulunamadı";
    console.log("Ürün açıklaması:", description);

    // Ürün görselleri ve videolarını al
    const allMediaElements = document.querySelectorAll('img, video, source');
    const mediaUrls = Array.from(allMediaElements)
      .map(el => el.src)
      .filter(src => src && (src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.png') || src.endsWith('.mp4')));
    console.log("Ürün medya dosyaları:", mediaUrls);

    // Ürün varyant seçeneklerini al
    const optionElements = document.querySelectorAll('[id^="variation-selector"] option');
    const options = optionElements.length > 1 ? Array.from(optionElements)
      .map(option => option.innerText)
      .filter(option => option !== 'Select an option') : ["Varyant seçenekleri bulunamadı"];
    console.log("Varyant seçenekleri:", options);

    return { title, price, description, images: mediaUrls, options };
  } catch (error) {
    console.error("Veri çekme hatası:", error.message);
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractProductData') {
    console.log("Veri çekme isteği alındı");
    const productData = extractProductData();
    if (productData) {
      chrome.runtime.sendMessage({ action: 'populateFields', productData });
    } else {
      chrome.runtime.sendMessage({ action: 'logError', message: "Veri çekme başarısız" });
    }
  }
});
