let header = document.querySelector('header');

window.addEventListener('scroll', () => {
  header.classList.toggle('shadow', window.scrollY > 0);
});


let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
  menu.classList.toggle('bx-x');
  navbar.classList.toggle('active');
};

window.addEventListener('scroll', () => {
  menu.classList.remove('bx-x');
  navbar.classList.remove('active');
});


let addToCartButtons = document.querySelectorAll(".shop-container .box a");
let cartCount = document.querySelector(".cart span");
let cartIcon = document.querySelector(".cart");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
  cartCount.textContent = cart.length;
}
updateCartCount();


addToCartButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    let productBox = btn.closest(".box");
    let name = productBox.querySelector("h2").textContent;
    let price = productBox.querySelector("span").textContent;
    let imgSrc = productBox.querySelector("img").src;

    let product = { name, price, imgSrc };

    let exists = cart.some((item) => item.name === name);
    if (!exists) {
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      alert(`${name} added to cart!`);
    } else {
      alert(`${name} is already in your cart.`);
    }
  });
});
cartIcon.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "cart.html";
});


document.querySelectorAll(".shop-container .box").forEach(product => {
  product.addEventListener("click", () => {
    let name = product.querySelector("h2").textContent;
    let price = product.querySelector("span").textContent;
    let img = product.querySelector("img").getAttribute("src");

    let productData = { name, price, img };
    localStorage.setItem("selectedProduct", JSON.stringify(productData));

    window.location.href = "../product/product.html";
  });
});
