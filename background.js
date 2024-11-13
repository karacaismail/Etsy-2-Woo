// background.js

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
          const productData = extractProductData();
          return productData;
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

    fetch("https://artogio.com/wp-json/wc/v3/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("ck_3de512b0e8fa4b56389b125df6c396b1f4fa5e3e:cs_df8b52c63fb0d6b0ce92b660fc6fc166a9a5c5d4")
      },
      body: JSON.stringify({
        name: title,
        regular_price: price,
        description: description,
        images: images.map(url => ({ src: url })),
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
    .then(data => console.log("WooCommerce'e gönderildi:", data))
    .catch(error => console.error("WooCommerce gönderim hatası:", error));
  }
});
