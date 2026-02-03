class CartDrawer extends HTMLElement {
    constructor() {
        super();
        this.addEventListener("keyup", (a) => "Escape" === a.code && this.close());
        this.querySelector("#CartDrawer-Overlay").addEventListener("click", this.close.bind(this));
        this.setHeaderCartIconAccessibility();
        this.wearWithElements = document.querySelectorAll("wear-with");
    }
    setHeaderCartIconAccessibility() {
        const a = document.querySelector("#cart-icon-bubble");
        a.setAttribute("role", "button");
        a.setAttribute("aria-haspopup", "dialog");
        a.addEventListener("click", (b) => {
            b.preventDefault();
            this.open(a);
        });
        a.addEventListener("keydown", (b) => {
            "SPACE" === b.code.toUpperCase() && (b.preventDefault(), this.open(a));
        });
    }
    open(a) {
        a && this.setActiveElement(a);
        (a = this.querySelector('[id^="Details-"] summary')) && !a.hasAttribute("role") && this.setSummaryAccessibility(a);
        setTimeout(() => {
            this.classList.add("animate", "active");
        });
        this.addEventListener(
            "transitionend",
            () => {
                const b = document.getElementById("CartDrawer"),
                    c = this.querySelector(".drawer__inner") || this.querySelector(".drawer__close");
                trapFocus(b, c);
            },
            { once: !0 }
        );
        this.wearWith();
        document.body.classList.add("overflow-hidden");
        "object" === typeof BOLD && BOLD.common && BOLD.common.eventEmitter && "function" === typeof BOLD.common.eventEmitter.emit && BOLD.common.eventEmitter.emit("BOLD_COMMON_cart_loaded");
    }
    close() {
        this.classList.remove("active");
        removeTrapFocus(this.activeElement);
        document.body.classList.remove("overflow-hidden");
    }
    setSummaryAccessibility(a) {
        a.setAttribute("role", "button");
        a.setAttribute("aria-expanded", "false");
        a.nextElementSibling.getAttribute("id") && a.setAttribute("aria-controls", a.nextElementSibling.id);
        a.addEventListener("click", (b) => {
            b.currentTarget.setAttribute("aria-expanded", !b.currentTarget.closest("details").hasAttribute("open"));
        });
        a.parentElement.addEventListener("keyup", onKeyUpEscape);
    }
    forceUpdateCartDrawer() {
        fetch("/cart")
            .then((a) => a.text())
            .then((a) => {
                ["cart-drawer .drawer__inner", "#cart-icon-bubble"].forEach((b) => {
                    const c = new DOMParser().parseFromString(a, "text/html"),
                        f = document.querySelector(b);
                    b = c.querySelector(b);
                    f && b && (f.innerHTML = b.innerHTML);
                });
                this.classList.contains("active") || this.open();
                "object" === typeof BOLD && BOLD.common && BOLD.common.eventEmitter && "function" === typeof BOLD.common.eventEmitter.emit && BOLD.common.eventEmitter.emit("BOLD_COMMON_cart_loaded");
              bundleUpdateCart();
            });
    }
    updateWearWith(a) {
        a = new DOMParser().parseFromString(a, "text/html").querySelector(".wear-with__desktop");
        const b = document.querySelector(".wear-with__desktop");
        a && b && ((b.innerHTML = a.innerHTML), this.wearWith());
    }
    renderContents(a) {
        updateCart();
    }
    wearWith(a = !1) {
        console.log("wearWith");
        const b = 749 < window.innerWidth ? this.querySelector(".wear-with__desktop wear-with") : this.querySelector(".wear-with__mobile wear-with");
        if (b) {
            var c = 749 < window.innerWidth ? ".wear-with__desktop" : ".wear-with__mobile",
                f = b.querySelector(".wear-with__swiper.swiper-initialized");
            f && (console.log("swiper already initialized, destroy it bitch"), f.swiper.destroy());
            f = b.getAttribute("data-url");
            var k = b.getAttribute("data-color"),
                l = b.getAttribute("data-product-id"),
                g = b.querySelector(".swiper-wrapper");
            if (g) {
                "" == g.innerHTML;
                var h = 0;
                a && (f = "/collections/all?sort_by=best-selling&view=wear-with");
                fetch(f)
                    .then((d) => d.text())
                    .then((d) => {
                        d = new DOMParser().parseFromString(d, "text/html").querySelectorAll(".card-product");
                        (a && 0 === d.length) ||
                            (d.forEach((e) => {
                                e.getAttribute("data-id") === l ||
                                    "The Canvas Bag" === e.getAttribute("data-title") ||
                                    "Gift wrapping" === e.getAttribute("data-title") ||
                                    6 <= h ||
                                    (e.classList.add("swiper-slide"),
                                    g.appendChild(e),
                                    k && (e = e.querySelector(`.quick-add__button--color[value="${k}"]`)) && (e.click(), (e.closest(".quick-add__colors").style.display = "none")),
                                    lazyImages(),
                                    h++);
                            }),
                            0 === h && this.wearWith(!0),
                            (d = 749 < window.innerWidth ? 3 : 2),
                            749 < window.innerWidth &&
                                new Swiper(".wear-with__swiper", {
                                    slidesPerView: d,
                                    spaceBetween: 20,
                                    allowTouchMove: !1,
                                    preventClicks: !0,
                                    preventClicksPropagation: !0,
                                    watchSlidesProgress: !0,
                                    loop: !1,
                                    navigation: { nextEl: `${c} .swiper-next`, prevEl: `${c} .swiper-prev` },
                                }));
                    })
                    .catch((d) => console.log(d));
            }
        }
    }
    getSectionInnerHTML(a, b = ".shopify-section") {
        return new DOMParser().parseFromString(a, "text/html").querySelector(b).innerHTML;
    }
    getSectionsToRender() {
        const sections = [
            { id: "cart-drawer", selector: "#CartDrawer" }, 
            { id: "cart-icon-bubble" },
            { id: window.cartFooterSectionId, selector: ".js-contents" },
            { id: window.cartItemsSectionId, selector: ".cart__contents" },
        ];
        
        // If on cart page, include cart page sections
        const isCartPage = window.location.pathname === '/cart' || window.location.pathname.includes('/cart');
        if (isCartPage) {
            const mainCartFooter = document.getElementById('main-cart-footer');
            const mainCartItems = document.getElementById('main-cart-items');
            
            if (mainCartFooter && mainCartFooter.dataset.id) {
                sections.push({
                    id: window.cartFooterSectionId,
                    section: window.cartFooterSectionId,
                    selector: '.js-contents'
                });
            }
            
            if (mainCartItems && mainCartItems.dataset.id) {
                sections.push({
                    id: window.cartItemsSectionId,
                    section: window.cartItemsSectionId,
                    selector: '.cart__items'
                });
            }
        }
        
        return sections;
    }
    getSectionDOM(a, b = ".shopify-section") {
        return new DOMParser().parseFromString(a, "text/html").querySelector(b);
    }
    setActiveElement(a) {
        this.activeElement = a;
    }
}
customElements.define("cart-drawer", CartDrawer);
class CartDrawerItems extends CartItems {
    getSectionsToRender() {
        const sections = [
            { id: "CartDrawer", section: "cart-drawer", selector: ".drawer__inner" },
            { id: "cart-icon-bubble", section: "cart-icon-bubble", selector: ".shopify-section" },
        ];
        
        // Always check if cart page sections exist (they might be on the page even if drawer is open)
        const mainCartFooter = document.getElementById('main-cart-footer');
        const mainCartItems = document.getElementById('main-cart-items');
        
        if (mainCartFooter && mainCartFooter.dataset.id) {
            sections.push({
                id: 'main-cart-footer',
                section: mainCartFooter.dataset.id,
                selector: '.js-contents'
            });
        }
        
        if (mainCartItems && mainCartItems.dataset.id) {
            sections.push({
                id: 'main-cart-items',
                section: mainCartItems.dataset.id,
                selector: '.cart__items'
            });
        }
        
        return sections;
    }
}
customElements.define("cart-drawer-items", CartDrawerItems);
class BundleRemove extends HTMLElement {
    constructor() {
        super();
        this.querySelector("button").addEventListener("click", this.onClick.bind(this));
        this.cartDrawer = document.querySelector("cart-drawer");
    }
    onClick() {
        const a = this.getAttribute("data-bundle-items").split(",");
        const a_key = this.getAttribute("data-bundle-items-key").split(",");
        let b = { updates: {}, sections: "cart-drawer,cart-icon-bubble,main-cart-items,main-cart-footer", sections_url: window.location.pathname };
        if(a_key){
          a_key?.forEach((c) => {
              if (c != "") {
                  b.updates[c?.trim()] = 0;
              }
          });
        }else{
          a.forEach((c) => {
              if (c != "") {
                  b.updates[c] = 0;
              }
          });
        }

        fetch("/cart/update.js", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) })
            .then((c) => c.json())
            .then((c) => {
                this.cartDrawer.renderContents(c);
                this.cartDrawer.classList.contains("active") || this.cartDrawer.open();
                setTimeout(function () {
                    document.querySelector("cart-drawer").forceUpdateCartDrawer();
                    document.querySelector("cart-items").forceUpdateCartDrawer();
                }, 1000);
                bundleUpdateCart();
            })
            .catch((c) => {
                console.error("Error:", c);
            });
    }
}
customElements.define("bundle-remove", BundleRemove);