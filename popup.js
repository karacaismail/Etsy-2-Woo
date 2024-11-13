document.addEventListener('DOMContentLoaded', () => {
  console.log("Popup yüklendi");

  const fetchDataButton = document.getElementById('fetchData');
  const sendDataButton = document.getElementById('sendData');

  // Verileri Çekme İşlemi
  fetchDataButton.addEventListener('click', () => {
    console.log("Verileri Çek butonuna tıklandı");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.log("Aktif sekme bulunamadı");
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => chrome.runtime.sendMessage({ action: 'extractProductData' })
      });
    });
  });

  // Verileri Alma ve Inputlara Yerleştirme
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'populateFields') {
      const { title, price, description, images, options } = request.productData;

      // Verileri input alanlarına ekleme
      document.getElementById('productTitle').value = title || "";
      document.getElementById('productPrice').value = price ? parseInt(price) : "";
      document.getElementById('productDescription').value = description || "";
      document.getElementById('productImages').value = images ? images.join(', ') : "";
      document.getElementById('productOptions').value = options ? options.join(', ') : "";

      console.log("Ürün bilgileri forma yerleştirildi");
    } else {
      console.error("Veri doldurma hatası: Bilgi alınamadı veya eksik veri");
    }
  });

  // Verileri Gönderme İşlemi
  sendDataButton.addEventListener('click', () => {
    console.log("Verileri Gönder butonuna tıklandı");

    const productData = {
      title: document.getElementById('productTitle').value,
      price: document.getElementById('productPrice').value,
      description: document.getElementById('productDescription').value,
      images: document.getElementById('productImages').value.split(',').map(url => url.trim()),
      options: document.getElementById('productOptions').value.split(',').map(option => option.trim())
    };

    chrome.runtime.sendMessage({ action: 'sendToWooCommerce', productData });
    console.log("Ürün verileri gönderildi:", productData);
  });
});
