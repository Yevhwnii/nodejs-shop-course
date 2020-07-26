// JS code which runs on the browser

const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const productElement = btn.closest('article');

  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => {
      // Extract body from Readable stream
      return result.json();
    })
    .then((data) => {
      console.log(data);
      // Doesnt work in IE
      //   productElement.remove()
      // Works in IE
      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => console.log(err));
};
