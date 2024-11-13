async function postToWooCommerce(productData) {
  const apiUrl = "https://your-woocommerce-website.com/wp-json/wc/v3/products";
  const auth = btoa("ck_Consumer_Key_Here:cs_Consumer_Secret_Here");

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
          name: "Color",
          options: productData.options
        }
      ],
      status: "draft"
    })
  });

  return response.json();
}

export default postToWooCommerce;


 
