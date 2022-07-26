//variable
const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const productsDom = document.querySelector(".products-center");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");
import { productsData } from "./products.js";
let cart = [];
let buttonsDOM = [];
//function
function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}
function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100px";
}
//class
class Products {
  //get from api points!
  getproducts() {
    return productsData;
  }
}
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((element) => {
      result += `<section class="product">
            <div class="image-container"><img class="products-img" src=${element.imageUrl}></div>
            <div class="products-desc">
                <p class="products-title">products title: ${element.title}</p>
                <p class="products-price">products price:$ ${element.price} </p>
            </div>
            <button class="add-to-cart" data-id=${element.id}>
            <i class="fa-solid fa-cart-plus"></i>
            add to cart
            </button>
            
            </section>`;
      productsDom.innerHTML = result;
    });
  }
  getAddToCartBtns() {
    const addToCartBtn = document.querySelectorAll(".add-to-cart");
    let addToCartBtnArray = [...addToCartBtn]; //convert nodelist to array
    buttonsDOM = [...addToCartBtn];
    addToCartBtnArray.forEach((btn) => {
      const id = btn.dataset.id;
      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;

        //get product from products:
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        //add to cart //updata cart

        cart = [...cart, addedProduct];
        //save cart to local storge
        Storage.saveCart(cart);
        //update cart value
        this.setCartValue(cart);
        //add to cart items
        this.addCartItem(addedProduct);
      });
    });
  }
  setCartValue(cart) {
    let tempCartItems = 0;
    const toalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `total price : ${toalPrice.toFixed(2)} $.`;
    cartItems.innerText = tempCartItems;
    // console.log(tempCartItems);
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
   
    <img src=${cartItem.imageUrl} alt="" class="cart-item-img">
    <div class="cart-item-desc">
        <h4>${cartItem.title}</h4>
        <h5>${cartItem.price} $</h5>
    </div>
    <div class="cart-item-controller">
        <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
        <p>${cartItem.quantity}</p>
        <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
    </div>
    <i class="fa-solid fa-trash-can" data-id=${cartItem.id}></i>
`;
    cartContent.appendChild(div);
  }
  setupApp() {
    //get cart from storage: getCart()
    cart = Storage.getCart() || [];

    //add cart items and show to modal
    cart.forEach((cartItem) => {
      this.addCartItem(cartItem);
    });
    //set values : price+items
    this.setCartValue(cart);
  }
  cartLogic() {
    //clear cart
    clearCart.addEventListener("click", () => this.clearCart());
    //cart content functions
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-chevron-up"))
        this.addedQuantity(event);
      else if (event.target.classList.contains("fa-chevron-down"))
        this.minusedQuantity(event);
      else if (event.target.classList.contains("fa-trash-can")) {
        this.removeCart(event);
      }
    });
  }
  clearCart() {
    //remove
    cart.forEach((cItem) => this.removeItem(cItem.id));
    //remove cart content children
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunction();
  }
  removeItem(id) {
    //update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    //update total price and items
    this.setCartValue(cart);
    //update storage
    Storage.saveCart(cart);
    //get add to cart buttons => update text and disable
    this.getSingleButtons(id);
  }
  getSingleButtons(id) {
    const buttons = buttonsDOM.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    console.log(buttons);
    const iTag = document.createElement("i");
    iTag.classList.add("fa-solid");
    iTag.classList.add("fa-cart-plus");
    buttons.disabled = false;
    buttons.innerText = "";
    buttons.appendChild(iTag);
    buttons.innerHTML += `add to cart`;
  }
  addedQuantity(event) {
    const addQuantitiy = event.target;
    //1.get item from cart
    const addedItem = cart.find(
      (cItem) => parseInt(cItem.id) === parseInt(addQuantitiy.dataset.id)
    );
    //2.update cart value
    addedItem.quantity++;
    this.setCartValue(cart);
    //3.save cart
    Storage.saveCart(cart);
    //4.updatecart item in UI:important notice
    addQuantitiy.nextElementSibling.innerText = addedItem.quantity;
  }
  minusedQuantity(event) {
    const minusQuantitiy = event.target;
    //1.get item from cart
    const minusedItem = cart.find(
      (cItem) => parseInt(cItem.id) === parseInt(minusQuantitiy.dataset.id)
    );
    //2.update cart value
    if (minusedItem.quantity === 1) {
      this.removeItem(minusedItem.id);
      cartContent.removeChild(minusQuantitiy.parentElement.parentElement);
      return;
    }
    minusedItem.quantity--;
    this.setCartValue(cart);
    //3.save cart
    Storage.saveCart(cart);
    //4.updatecart item in UI:important notice
    minusQuantitiy.previousElementSibling.innerText = minusedItem.quantity;
  }
  removeCart(event) {
    const removedCart = event.target;
    const removeCart = cart.find(
      (cItem) => parseInt(cItem.id) === parseInt(removedCart.dataset.id)
    );
    this.removeItem(removeCart.id);
    cartContent.removeChild(removedCart.parentElement);
  }
}
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    try {
      return JSON.parse(localStorage.getItem("cart"));
    } catch (err) {
      return [];
    }
  }
}
//addEventListener
cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);
document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getproducts();
  //setup: get cart and setup app.
  const ui = new UI();
  ui.setupApp();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns(productsData);
  ui.cartLogic();

  Storage.saveProducts(productsData); //static and dont use new key word
});
