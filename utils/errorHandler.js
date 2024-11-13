export function handleContentScriptError(error) {
  chrome.runtime.sendMessage({
    action: "logError",
    message: error.message,
    source: "contentScript"
  });
  console.error("Content Script Error:", error);
}
