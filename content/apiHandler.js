// apiHandler.js

// WooCommerce API'ye ürün gönderme fonksiyonu
export async function postToWooCommerce(productData) {
  try {
    // Chrome Storage'dan WooCommerce URL, API Key ve Secret'i alın
    const settings = await new Promise((resolve, reject) => {
      chrome.storage.sync.get(['wooCommerceUrl', 'wooApiKey', 'wooApiSecret'], (settings) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(settings);
        }
      });
    });

    const { wooCommerceUrl, wooApiKey, wooApiSecret } = settings;

    // WooCommerce ayarlarının eksik olup olmadığını kontrol et
    if (!wooCommerceUrl || !wooApiKey || !wooApiSecret) {
      throw new Error("WooCommerce ayarları eksik. Lütfen tüm bilgileri girin.");
    }

    // API URL'yi oluşturun ve sonunda çift `//` olmadığından emin olun
    const apiUrl = `${wooCommerceUrl.replace(/\/$/, "")}/wp-json/wc/v3/products`;
    const auth = btoa(`${wooApiKey}:${wooApiSecret}`);

    // Ürün verisini API'ye gönderin
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: productData.title,
        regular_price: productData.price,
        description: productData.description,
        images: productData.images.map(url => ({ src: url })),
        attributes: [
          {
            name: "Varyantlar",
            options: productData.options
          }
        ],
        status: "draft"
      })
    });

    // API cevabını kontrol et
    const result = await response.json();
    if (!response.ok) {
      // Hata durumunda background.js'e bildirim gönder
      chrome.runtime.sendMessage({ action: 'wooCommerceError', message: result.message || "WooCommerce gönderim hatası" });
      throw new Error(result.message || "WooCommerce gönderim hatası");
    }

    console.log("WooCommerce'e gönderildi:", result);
    // WooCommerce gönderiminin başarılı olduğunu background.js'e bildirin
    chrome.runtime.sendMessage({ action: 'wooCommerceSuccess', result });
    return result;
  } catch (error) {
    console.error("WooCommerce gönderim hatası:", error);
    // Hata durumunda background.js'e bildirim gönder
    chrome.runtime.sendMessage({ action: 'wooCommerceError', message: error.message });
    throw error; // Hatanın üst katmanlara iletilmesi
  }
}

export default { postToWooCommerce };
