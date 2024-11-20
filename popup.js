document.addEventListener('DOMContentLoaded', () => {
  console.log("Popup yüklendi");

  const fetchDataButton = document.getElementById('fetchData');
  const sendDataButton = document.getElementById('sendData');
  const saveSettingsButton = document.getElementById('saveSettings');
  const productTabButton = document.getElementById('productTabButton');
  const settingsTabButton = document.getElementById('settingsTabButton');
  const productTab = document.getElementById('productTab');
  const settingsTab = document.getElementById('settingsTab');
  const feedbackContainer = document.getElementById('feedbackContainer'); // Geri bildirim göstermek için
  const loadingSpinner = document.getElementById('loadingSpinner'); // Yükleme animasyonu göstermek için

  // Pop-up açıldığında ayarları yükle
  chrome.storage.sync.get(['wooCommerceUrl', 'wooApiKey', 'wooApiSecret'], (settings) => {
    if (settings.wooCommerceUrl) {
      document.getElementById('wooCommerceUrl').value = settings.wooCommerceUrl;
    }
    if (settings.wooApiKey) {
      document.getElementById('wooApiKey').value = settings.wooApiKey;
    }
    if (settings.wooApiSecret) {
      document.getElementById('wooApiSecret').value = settings.wooApiSecret;
    }
  });

  // Sekme Geçişleri
  productTabButton.addEventListener('click', () => {
    productTab.classList.add('active');
    settingsTab.classList.remove('active');
    productTabButton.classList.add('active');
    settingsTabButton.classList.remove('active');
  });

  settingsTabButton.addEventListener('click', () => {
    settingsTab.classList.add('active');
    productTab.classList.remove('active');
    settingsTabButton.classList.add('active');
    productTabButton.classList.remove('active');
  });

  // Ayarları Kaydetme İşlemi
  saveSettingsButton.addEventListener('click', () => {
    const wooCommerceUrl = document.getElementById('wooCommerceUrl').value.trim();
    const wooApiKey = document.getElementById('wooApiKey').value.trim();
    const wooApiSecret = document.getElementById('wooApiSecret').value.trim();

    // Tüm alanların doldurulup doldurulmadığını kontrol et
    if (!wooCommerceUrl || !wooApiKey || !wooApiSecret) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    // Ayarları Chrome Storage'a kaydet
    chrome.storage.sync.set({ wooCommerceUrl, wooApiKey, wooApiSecret }, () => {
      console.log("Ayarlar kaydedildi:", { wooCommerceUrl, wooApiKey, wooApiSecret });
      alert("Ayarlar başarıyla kaydedildi!");
    });
  });

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

      // Görseller ve Videolar için input alanını güncelleme
      document.getElementById('productTitle').value = title || "";
      document.getElementById('productPrice').value = price ? parseInt(price) : "";
      document.getElementById('productDescription').value = description || "";
      document.getElementById('productImages').value = images && images.length > 0 ? images.join(', ') : "";
      document.getElementById('productOptions').value = options && options.length > 0 ? options.join(', ') : "";

      console.log("Ürün bilgileri forma yerleştirildi, medya dosyaları dahil:", images);
    } else if (request.action === 'logError') {
      console.error("Hata: ", request.message);
    } else if (request.action === 'wooCommerceFeedback') {
      // Yükleme animasyonunu durdur
      loadingSpinner.classList.add('hidden');

      // WooCommerce geri bildirimi kullanıcıya gösterme
      if (request.status === 'success') {
        feedbackContainer.innerText = "Ürün başarıyla WooCommerce'a gönderildi!";
        feedbackContainer.classList.remove('error');
        feedbackContainer.classList.add('success');
      } else if (request.status === 'error') {
        feedbackContainer.innerText = `WooCommerce gönderim hatası: ${request.message}`;
        feedbackContainer.classList.remove('success');
        feedbackContainer.classList.add('error');
      }
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

    // Yükleme animasyonunu başlat
    loadingSpinner.classList.remove('hidden');
    feedbackContainer.textContent = ""; // Önceki geri bildirimleri temizle

    // WooCommerce API'ye gönder
    chrome.runtime.sendMessage({ action: 'sendToWooCommerce', productData });
  });
});
