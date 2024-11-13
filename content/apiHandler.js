async function postToWooCommerce(productData) {
  const apiUrl = "https://artogio.com/wp-json/wc/v3/products";
  const auth = btoa("ck_3de512b0e8fa4b56389b125df6c396b1f4fa5e3e:cs_df8b52c63fb0d6b0ce92b660fc6fc166a9a5c5d4");

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
