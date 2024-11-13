# Etsy-2-Woo
Copy Etsy Product to WooCommerce via Chrome Extension

### Etsy Product to WooCommerce Transfer Chrome Extension – Technical Documentation

This document details the technical structure, file organisation, and function of a Chrome extension that transfers product data from Etsy to WooCommerce. The extension scrapes product information from Etsy and submits it to WooCommerce, employing a modular and reusable function structure. The documentation aims to clarify the code's operation from a developer’s perspective.

### Adding WooCommerce API Key and Secret

This Chrome extension uses the WooCommerce REST API to send product information to WooCommerce. To enable access to your WooCommerce store, you'll need to add your API keys to the extension. Follow the steps below to enter your API Key and Secret.

1. **Obtain API Keys from WooCommerce:**
   - Go to your WooCommerce admin dashboard.
   - Navigate to **WooCommerce > Settings > Advanced > REST API**.
   - Select **Add Key** to generate your API keys.
   - Set **Permissions** to **Read/Write**.
   - Click **Generate API Key**. This will provide you with two keys:
     - **Consumer Key** (e.g., `ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
     - **Consumer Secret** (e.g., `cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

2. **Add API Keys to the Code:**
   - Open the relevant file, such as `background.js` or `apiHandler.js`, and locate the following line:

     ```javascript
     const auth = btoa("ck_Consumer_Key_Here:cs_Consumer_Secret_Here");
     ```

   - Replace `ck_Consumer_Key_Here` and `cs_Consumer_Secret_Here` with your **Consumer Key** and **Consumer Secret**. For example:

     ```javascript
     const auth = btoa("ck_your_consumer_key:cs_your_consumer_secret");
     ```

3. **Security Note:**
   - Storing these keys directly in the code can pose a security risk. If possible, consider storing them in a secure `.env` file and referencing them in your code.

4. **Set Up the Authentication Header:**
   - The `auth` variable is then used in the `Authorization` header for API requests:

     ```javascript
     headers: {
       "Authorization": "Basic " + auth
     }
     ```

Your extension is now set up to connect to the WooCommerce API and transfer product information to the specified WooCommerce store.
---
#### 1. General Structure and Functionality

The extension enables users to extract product data from an active Etsy product page and submit it to WooCommerce via an API. User interaction is facilitated through a popup interface, while data processing is managed by `content.js`, `background.js`, and utility files located in the `utils` directory. 

#### 2. Manifest File: `manifest.json`

The `manifest.json` file is the main configuration file, specifying the extension’s operational attributes. Key sections are explained below:

```json
{
  "manifest_version": 3,
  "name": "Etsy 2 WooCommerce",
  "version": "1.0",
  "permissions": ["activeTab", "scripting", "storage", "tabs"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": "images/icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["https://www.etsy.com/listing/*"],
      "js": ["content/content.js"]
    }
  ]
}
```

- **`manifest_version`**: Version `3` enables the latest Chrome features.
- **`permissions`**: The extension requires permissions for `activeTab`, `scripting`, `storage`, and `tabs` to allow data retrieval and storage.
- **`background`**: Defines `background.js` as the service worker.
- **`content_scripts`**: Specifies that `content.js` should only run on Etsy product pages.

#### 3. Popup Interface Files

##### `popup.html`

This file provides the user interface, with buttons and input fields to display and edit the product information.

##### `popup.js`

`popup.js` manages user interactions, displaying and controlling the data:

- **`DOMContentLoaded`**: Adds event listeners to `fetchDataButton` and `sendDataButton` once the popup loads.
- **Fetch Data Button**: Initiates a request to scrape product data from the active tab.
- **Send Data Button**: Sends the edited product data to WooCommerce via the background script.

```javascript
fetchDataButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: extractProductData
    });
  });
});
```

#### 4. Background Script: `background.js`

`background.js` runs persistently, handling messages from the content script and making API calls to WooCommerce. Notable functions include:

- **`onMessage`**: Listens for `extractProductData` or `sendToWooCommerce` actions from the popup and responds accordingly.
- **`sendToWooCommerce`**: Posts product data to WooCommerce’s API, saving it as a draft.

```javascript
if (request.action === 'sendToWooCommerce') {
  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa("consumerKey:consumerSecret")
    },
    body: JSON.stringify({
      name: title,
      regular_price: price,
      description: description,
      images: images.map(url => ({ src: url })),
      status: "draft"
    })
  })
  .then(response => response.json())
  .then(data => console.log("Sent to WooCommerce:", data))
  .catch(error => console.error("Send error:", error));
}
```

#### 5. Content Script: `content.js`

`content.js` extracts product data from an Etsy product page, including title, price, description, images, and variants:

```javascript
function extractProductData() {
  const title = document.querySelector('h1[data-buy-box-listing-title]').innerText;
  const price = parseFloat(document.querySelector('div[data-selector="price-only"]').innerText.replace(/[^0-9]/g, ""));
  const images = Array.from(document.querySelectorAll('ul.carousel-pane-list img')).map(img => img.src);
  return { title, price, images };
}
```

This function is invoked via message passing and sends the scraped data to the popup.

#### 6. Utility Files (`/utils`)

Utility files provide reusable functionality for various operations.

##### `helperFunctions.js`

This file contains functions for formatting and validating data:

- **`formatPrice`**: Cleans the price string, retaining only numeric values.
- **`isValidImageUrl`**: Checks if a URL points to a valid image format.

```javascript
export function formatPrice(priceString) {
  return parseFloat(priceString.replace(/[^0-9.,-]+/g, "").replace(",", "."));
}
```

##### `errorHandler.js`

Manages errors in the content script and reports them to the developer console:

```javascript
export function handleContentScriptError(error) {
  chrome.runtime.sendMessage({
    action: "logError",
    message: error.message,
    source: "contentScript"
  });
  console.error("Content Script Error:", error);
}
```

##### `productDataValidator.js`

Validates the product data to ensure completeness before sending to WooCommerce. The `validateProductData` function checks the title, price, and images:

```javascript
export function validateProductData(data) {
  if (!data.title) throw new Error("Product title not found.");
  if (!data.price || isNaN(data.price)) throw new Error("Invalid price.");
  if (!data.images.length) throw new Error("At least one product image is required.");
  return true;
}
```

#### 7. Data Extraction and Validation: `extractProductData.js`

`extractProductData.js` consolidates data extraction and validation, ensuring product data is correctly formatted for WooCommerce.

```javascript
function extractProductData() {
  const title = document.querySelector('h1[data-buy-box-listing-title]').innerText;
  const price = formatPrice(document.querySelector('div[data-selector="price-only"]').innerText);
  const images = Array.from(document.querySelectorAll('ul.carousel-pane-list img'))
    .map(img => img.src)
    .filter(url => isValidImageUrl(url));
  return { title, price, images };
}
```

#### 8. API Handler: `apiHandler.js`

The API handler module, `apiHandler.js`, manages posting product data to WooCommerce’s API and saving it as a draft.

```javascript
async function postToWooCommerce(productData) {
  const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Basic " + auth }, body: JSON.stringify(productData) });
  return await response.json();
}
export default postToWooCommerce;
```

#### 9. Workflow

1. **User Interaction**: The user initiates data scraping and submission from the popup interface.
2. **Data Scraping**: `content.js` scrapes product data from Etsy.
3. **Data Submission**: `background.js` posts the data to WooCommerce as a draft.
4. **Validation and Error Handling**: Utility files validate the data and manage errors, ensuring data consistency and stability.

#### 10. Conclusion

This extension’s modular structure facilitates easy maintenance and provides a reliable solution for transferring product data to WooCommerce. Its use of validation and error handling enhances developer control and ensures a smooth user experience.
