chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Mesaj alındı:", request);

  if (request.action === 'extractProductData') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.log("Aktif sekme bulunamadı");
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          // Ürün verilerini sayfa içeriğinden çekme işlemi
          const titleElement = document.querySelector('h1[data-buy-box-listing-title]');
          const title = titleElement ? titleElement.innerText : "Başlık bulunamadı";

          const priceElement = document.querySelector('div[data-selector="price-only"] p');
          let price = priceElement ? priceElement.innerText : "Fiyat bulunamadı";
          price = price.split('.')[0].replace(/[^\d]/g, '');  // Nokta öncesi tamsayıyı al

          const descriptionElement = document.querySelector('p[data-product-details-description-text-content]');
          const description = descriptionElement ? descriptionElement.innerText : "Açıklama bulunamadı";

          const imageElements = document.querySelectorAll('ul.carousel-pane-list img');
          const images = imageElements.length > 0 ? Array.from(imageElements).map(img => img.src) : [];

          const allSources = document.querySelectorAll('source, video');
          const videoUrls = Array.from(allSources)
            .map(source => source.src)
            .filter(src => src && src.endsWith('.mp4'));

          const mediaFiles = [...images, ...videoUrls];

          const optionElements = document.querySelectorAll('#variation-selector-0 option');
          const options = optionElements.length > 1 ? Array.from(optionElements)
            .map(option => option.innerText)
            .filter(option => option !== 'Select an option') : ["Varyant seçenekleri bulunamadı"];

          return {
            title,
            price,
            description,
            images: mediaFiles,
            options
          };
        }
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error("Script enjekte edilemedi:", chrome.runtime.lastError.message);
        } else {
          const productData = results[0]?.result;
          if (productData) {
            console.log("Ürün verileri çekildi:", productData);
            chrome.runtime.sendMessage({ action: 'populateFields', productData });
          } else {
            console.error("Veri çekilemedi veya eksik veri");
          }
        }
      });
    });
  }

  if (request.action === 'sendToWooCommerce') {
    const { title, price, description, images, options } = request.productData;

    // WooCommerce URL ve API bilgilerini Chrome storage'dan almak
    chrome.storage.sync.get(['wooCommerceUrl', 'wooApiKey', 'wooApiSecret'], (settings) => {
      const { wooCommerceUrl, wooApiKey, wooApiSecret } = settings;

      if (!wooCommerceUrl || !wooApiKey || !wooApiSecret) {
        console.error("WooCommerce ayarları eksik. Lütfen tüm bilgileri girin.");
        chrome.runtime.sendMessage({
          action: 'wooCommerceFeedback',
          status: 'error',
          message: "WooCommerce ayarları eksik. Lütfen tüm bilgileri girin."
        });
        return;
      }

      // Doğru WooCommerce URL'yi kontrol etmek
      const apiUrl = `${wooCommerceUrl.replace(/\/+$/, '')}/wp-json/wc/v3/products`;

      // Görsel ve video URL'lerini birleştir
      const mediaFiles = images.map(url => {
        if (url.endsWith(".mp4")) {
          return { src: url, type: "video" };
        } else {
          return { src: url, type: "image" };
        }
      });

      // WooCommerce API isteği gönderme
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${wooApiKey}:${wooApiSecret}`)
        },
        body: JSON.stringify({
          name: title,
          regular_price: price,
          description: description,
          images: mediaFiles,
          attributes: [
            {
              name: "Varyantlar",
              options: options
            }
          ],
          status: "draft"  // Ürün taslak olarak kaydedilecek
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.id) {
          console.log("WooCommerce'e gönderildi:", data);
          chrome.runtime.sendMessage({
            action: 'wooCommerceFeedback',
            status: 'success',
            message: "Ürün başarıyla WooCommerce'a gönderildi!"
          });
        } else {
          console.error("WooCommerce gönderim hatası:", data);
          chrome.runtime.sendMessage({
            action: 'wooCommerceFeedback',
            status: 'error',
            message: `WooCommerce gönderim hatası: ${data.message || "Bilinmeyen hata"}`
          });
        }
      })
      .catch(error => {
        console.error("WooCommerce gönderim hatası:", error);
        chrome.runtime.sendMessage({
          action: 'wooCommerceFeedback',
          status: 'error',
          message: `WooCommerce gönderim hatası: ${error.message}`
        });
      });
    });
  }
});
