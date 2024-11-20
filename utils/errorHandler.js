export function handleContentScriptError(error) {
  // Hata mesajını ve detaylarını logla
  console.error("Content Script Error:", error);

  // Hata detaylarını runtime mesaj olarak gönder
  chrome.runtime.sendMessage({
    action: "logError",
    message: error.message,
    stack: error.stack, // Hata yığını (stack trace) eklenerek daha fazla detay sağlanıyor
    source: "contentScript",
    timestamp: new Date().toISOString() // Hatanın ne zaman olduğunu belirlemek için
  });

  // İsteğe bağlı: Hatanın türüne göre ek işlemler yapabilirsiniz
  if (error.name === "TypeError") {
    console.warn("Tip hatası oluştu. Verilerinizi kontrol edin.");
  } else if (error.name === "NetworkError") {
    console.warn("Ağ hatası oluştu. Bağlantınızı kontrol edin.");
  }
}
