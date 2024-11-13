import { formatPrice, isValidImageUrl } from '../utils/helperFunctions.js';

function extractProductData() {
  const title = document.querySelector('h1[data-buy-box-listing-title]').innerText;
  const price = formatPrice(document.querySelector('div[data-selector="price-only"] p').innerText);
  const description = document.querySelector('p[data-product-details-description-text-content]').innerText;

  const images = Array.from(document.querySelectorAll('ul.carousel-pane-list img'))
                      .map(img => img.src)
                      .filter(isValidImageUrl);  // Sadece geçerli resim URL’leri

  const options = Array.from(document.querySelectorAll('#variation-selector-0 option'))
                      .map(option => option.innerText)
                      .filter(option => option !== 'Select an option');

  return {
    title,
    price,
    description,
    images,
    options
  };
}

export default extractProductData;
