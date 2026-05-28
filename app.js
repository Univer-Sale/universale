/* ==========================================================================
   UNIVERSALE PORTFOLIO E-COMMERCE ENGINE (VANILLA JS)
   ========================================================================== */

// 1. STATE & STORAGE MANAGEMENT
let storeConfig = {
    phone: '+94707833043',
    currency: 'LKR',
    title: 'UNIVER SALE'
};

let shoppingCart = [];
let activeFeaturedSlide = 0;
let featuredSlideInterval = null;

// Load Config from localStorage or initialize defaults
function initConfig() {
    const savedPhone = localStorage.getItem('us_wa_phone');
    const savedCurrency = localStorage.getItem('us_currency');
    const savedTitle = localStorage.getItem('us_store_title');

    if (savedPhone) storeConfig.phone = savedPhone;
    if (savedCurrency) storeConfig.currency = savedCurrency;
    if (savedTitle) storeConfig.title = savedTitle;

    // Apply Brand Title & Currency to UI elements
    updateConfigUI();
}

function saveConfig(phone, currency, title) {
    // Basic validation to clean up phone number
    const cleanPhone = phone.replace(/[^+\d]/g, '');
    
    localStorage.setItem('us_wa_phone', cleanPhone);
    localStorage.setItem('us_currency', currency);
    localStorage.setItem('us_store_title', title);
    
    storeConfig.phone = cleanPhone;
    storeConfig.currency = currency;
    storeConfig.title = title;

    updateConfigUI();
    renderProducts();
    renderFeaturedProducts();
    updateCartUI();
}

function updateConfigUI() {
    // Dynamic text replacements
    const brandElements = document.querySelectorAll('.brand-title');
    brandElements.forEach(el => {
        el.innerHTML = storeConfig.title.replace(' ', '<span class="gradient-text-blue">') + '</span>';
    });

    const directWaBtn = document.getElementById('hero-direct-wa');
    if (directWaBtn) {
        directWaBtn.href = `https://wa.me/${storeConfig.phone.replace('+', '')}?text=Hello%20${encodeURIComponent(storeConfig.title)}!%20I%20would%20like%20to%20inquire%20about%20your%20products.`;
    }

    const footerWaBtn = document.getElementById('footer-wa-social');
    if (footerWaBtn) {
        footerWaBtn.href = `https://wa.me/${storeConfig.phone.replace('+', '')}?text=Hello!`;
    }
}

// 2. PRODUCT DATABASE
const productCatalog = [
    {
        id: 'P01',
        name: 'Y47 Cat Headset',
        category: 'Gadgets',
        price: 1750,
        code: 'US-CAT-01',
        popularity: 99,
        image: './assets/products/y47_headset.jpg',
        description: 'Y47 Wireless Headphones with glowing Cat Ears are the ultimate accessory for gaming, streaming, and music. Equipped with child-safe volume limitation, a foldable space-saving headband, and bluetooth BT 5.0 wireless connectivity, these headphones support micro SD/TF cards, FM radio, and standard 3.5mm AUX wired cables.',
        specs: [
            'Bluetooth Version: Bluetooth 5.0',
            'Working distance: 15m range',
            'Battery: 400 mAh Li-ion rechargeable',
            'Charging time: about 2.5 hours',
            'Music / Talk: LED on ~7 hrs | LED off ~12 hrs',
            'Impedance: 32Ω | Sensitivity: 105 ± 13db'
        ],
        features: [
            'Multicolor Cat Ears Glow',
            'Children-Safe Volume',
            'Foldable Space-Saving',
            'Bluetooth 5.0 Wireless',
            'SD Card & Aux Support',
            'Integrated Microphone'
        ]
    }
];

// 3. CATALOG FILTERING & RENDERING
function renderProducts(filter = 'all', sort = 'popular', query = '') {
    const grid = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results-view');
    
    if (!grid) return;

    // Filter products
    let filteredList = productCatalog.filter(p => {
        const matchesCategory = filter === 'all' || p.category === filter;
        const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || 
                             p.category.toLowerCase().includes(query.toLowerCase()) ||
                             p.code.toLowerCase().includes(query.toLowerCase()) ||
                             p.description.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
    });

    // Sort products
    if (sort === 'price-asc') {
        filteredList.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
        filteredList.sort((a, b) => b.price - a.price);
    } else { // default: popularity
        filteredList.sort((a, b) => b.popularity - a.popularity);
    }

    // Toggle No Results View
    if (filteredList.length === 0) {
        grid.classList.add('hide');
        noResults.classList.remove('hide');
        
        // If the catalog is completely empty, it means we are in customization upload mode!
        if (productCatalog.length === 0) {
            noResults.innerHTML = `
                <i data-lucide="upload-cloud" class="no-results-icon" style="color: var(--accent-cyan); width: 48px; height: 48px; margin-bottom: 12px;"></i>
                <h3>Catalog Launching Soon</h3>
                <p>Welcome to ${storeConfig.title}! We are currently curating and uploading our custom line-up of gadgets, electronics, DIY tools, and smart household items. If you have immediate orders or special requests, please click below to contact us directly on WhatsApp!</p>
                <a href="https://wa.me/${storeConfig.phone.replace('+', '')}?text=Hello%20${encodeURIComponent(storeConfig.title)}!%20I%20would%20like%20to%20inquire%20about%20your%20products." target="_blank" class="btn btn-accent btn-glow" style="margin-top: 15px;">
                    <i data-lucide="message-square"></i> Contact Store on WhatsApp
                </a>
            `;
            lucide.createIcons();
        }
        return;
    } else {
        grid.classList.remove('hide');
        noResults.classList.add('hide');
    }

    // Clear and build cards
    grid.innerHTML = '';
    filteredList.forEach(p => {
        const card = document.createElement('article');
        card.className = 'product-card glass';
        card.setAttribute('data-id', p.id);
        
        card.innerHTML = `
            <div class="card-img-wrapper" onclick="openDetails('${p.id}')">
                <img src="${p.image}" alt="${p.name}" class="product-thumbnail" loading="lazy">
                <span class="card-badge-cat gradient-purple-bg">${p.category}</span>
                <button class="quick-view-btn"><i data-lucide="eye"></i> Quick View</button>
            </div>
            <div class="card-info">
                <span class="product-code">${p.code}</span>
                <h3 class="product-title" onclick="openDetails('${p.id}')">${p.name}</h3>
                <p class="product-desc-excerpt">${p.description}</p>
                <div class="card-bottom-row">
                    <span class="card-price">${formatPrice(p.price)}</span>
                    <div class="card-actions">
                        <button class="cart-add-btn" onclick="addToCart('${p.id}')" aria-label="Add to cart">
                            <i data-lucide="shopping-cart"></i>
                        </button>
                        <button class="btn btn-accent card-buy-btn" onclick="buyNowSingle('${p.id}')">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Reinitialize icons in newly created items
    lucide.createIcons();
}

function formatPrice(amount) {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${storeConfig.currency}`;
}

// 4. FEATURED HERO SLIDER
function renderFeaturedProducts() {
    const container = document.getElementById('featured-slides');
    const dotsContainer = document.getElementById('slider-dots');
    
    if (!container || !dotsContainer) return;

    // Gather top 3 popular products as featured
    const featured = [...productCatalog].sort((a, b) => b.popularity - a.popularity).slice(0, 3);
    
    container.innerHTML = '';
    dotsContainer.innerHTML = '';

    if (featured.length === 0) {
        // Render a beautiful branding placeholder slide when the store is in configuration
        const slide = document.createElement('div');
        slide.className = 'slide active';
        slide.innerHTML = `
            <div class="slide-img-wrapper">
                <img src="./logo.jpg" alt="UniverSale Premium Store" class="slide-img" style="opacity: 0.35; filter: blur(2px); object-fit: scale-down;">
            </div>
            <div class="slide-content">
                <span class="slide-tag gradient-magenta-bg">Curating Showcase</span>
                <h3 class="slide-title">Welcome to ${storeConfig.title}!</h3>
                <p class="slide-desc">We are currently customizing our premium catalog with new product photos, prices, and specifications. Get ready to experience next-generation innovations!</p>
                <div class="slide-price-row">
                    <span class="slide-price">Islandwide Delivery</span>
                    <a href="https://wa.me/${storeConfig.phone.replace('+', '')}?text=Hello%20${encodeURIComponent(storeConfig.title)}!%20I%20would%20like%20to%20inquire%20about%20your%20products." target="_blank" class="btn btn-primary btn-glow">
                        <i data-lucide="message-square"></i> Inquire via WhatsApp
                    </a>
                </div>
            </div>
        `;
        container.appendChild(slide);
        
        const dot = document.createElement('button');
        dot.className = 'indicator-dot active';
        dotsContainer.appendChild(dot);
        lucide.createIcons();
        return;
    }

    featured.forEach((p, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = `slide ${index === 0 ? 'active' : ''}`;
        
        slide.innerHTML = `
            <div class="slide-img-wrapper">
                <img src="${p.image}" alt="${p.name}" class="slide-img">
            </div>
            <div class="slide-content">
                <span class="slide-tag gradient-magenta-bg">${p.category} Showcase</span>
                <h3 class="slide-title">${p.name}</h3>
                <p class="slide-desc">${p.description.substring(0, 120)}...</p>
                <div class="slide-price-row">
                    <span class="slide-price">${formatPrice(p.price)}</span>
                    <button class="btn btn-primary" onclick="openDetails('${p.id}')">
                        <i data-lucide="info"></i> Full Specifications
                    </button>
                </div>
            </div>
        `;
        container.appendChild(slide);

        // Create indicator dot
        const dot = document.createElement('button');
        dot.className = `indicator-dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => setSlide(index));
        dotsContainer.appendChild(dot);
    });

    lucide.createIcons();
    startSlideTimer();
}

function startSlideTimer() {
    stopSlideTimer();
    featuredSlideInterval = setInterval(() => {
        const slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return;
        let next = (activeFeaturedSlide + 1) % slides.length;
        setSlide(next);
    }, 6000);
}

function stopSlideTimer() {
    if (featuredSlideInterval) clearInterval(featuredSlideInterval);
}

function setSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.indicator-dot');
    
    if (slides.length === 0 || index >= slides.length) return;

    slides[activeFeaturedSlide].classList.remove('active');
    dots[activeFeaturedSlide].classList.remove('active');

    activeFeaturedSlide = index;

    slides[activeFeaturedSlide].classList.add('active');
    dots[activeFeaturedSlide].classList.add('active');
}

// 5. SHOPPING CART ENGINE
function addToCart(productId) {
    const product = productCatalog.find(p => p.id === productId);
    if (!product) return;

    const existing = shoppingCart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        shoppingCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            code: product.code,
            image: product.image,
            quantity: 1
        });
    }

    updateCartUI();
    animateCartCount();
}

function animateCartCount() {
    const countBadge = document.getElementById('cart-count');
    if (countBadge) {
        countBadge.classList.remove('bounce-in');
        void countBadge.offsetWidth; // Trigger reflow to restart CSS animation
        countBadge.classList.add('bounce-in');
    }
}

function updateCartQty(productId, amount) {
    const item = shoppingCart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += amount;
    if (item.quantity <= 0) {
        shoppingCart = shoppingCart.filter(item => item.id !== productId);
    }
    updateCartUI();
}

function removeItemFromCart(productId) {
    shoppingCart = shoppingCart.filter(item => item.id !== productId);
    updateCartUI();
}

function clearCart() {
    shoppingCart = [];
    updateCartUI();
}

function calculateSubtotal() {
    return shoppingCart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const navCartTotal = document.getElementById('nav-cart-total');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');

    // Calculate details
    const totalQty = shoppingCart.reduce((qty, item) => qty + item.quantity, 0);
    const totalPrice = calculateSubtotal();

    // Set navbar totals
    if (cartCount) cartCount.innerText = totalQty;
    if (navCartTotal) navCartTotal.innerText = formatPrice(totalPrice);

    // Build Cart list
    if (cartItemsContainer) {
        if (shoppingCart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-view">
                    <i data-lucide="shopping-bag"></i>
                    <p>Your shopping cart is currently empty. Explore our catalog to add modern gadgets!</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = '';
            shoppingCart.forEach(item => {
                const row = document.createElement('div');
                row.className = 'cart-item';
                row.innerHTML = `
                    <div class="cart-item-img-wrapper">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-code">${item.code}</span>
                        <div class="cart-item-controls">
                            <div class="quantity-controller">
                                <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)"><i data-lucide="minus"></i></button>
                                <span class="qty-num">${item.quantity}</span>
                                <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)"><i data-lucide="plus"></i></button>
                            </div>
                            <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
                            <button class="remove-item-btn" onclick="removeItemFromCart('${item.id}')" aria-label="Remove item">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(row);
            });
            lucide.createIcons();
        }
    }

    // Set checkout totals
    if (cartSubtotal) cartSubtotal.innerText = formatPrice(totalPrice);
    if (cartTotal) cartTotal.innerText = formatPrice(totalPrice);
}

// 6. WHATSAPP LINK COMPILERS
function buyNowSingle(productId) {
    const product = productCatalog.find(p => p.id === productId);
    if (!product) return;

    const message = `Hello ${storeConfig.title}! 👋\n\nI would like to purchase the following item directly:\n\n🛍️ *Item:* ${product.name}\n🔖 *Code:* ${product.code}\n💰 *Price:* ${formatPrice(product.price)}\n\nPlease let me know stock availability and checkout steps!`;
    
    // Format number: remove plus sign
    const waNumber = storeConfig.phone.replace('+', '');
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function buyNowSingleWithQty(productId, quantity) {
    const product = productCatalog.find(p => p.id === productId);
    if (!product) return;

    const totalCost = product.price * quantity;
    const message = `Hello ${storeConfig.title}! 👋\n\nI would like to order this item:\n\n🛍️ *Item:* ${product.name}\n🔖 *Code:* ${product.code}\n🔢 *Quantity:* ${quantity}\n💰 *Total Cost:* ${formatPrice(totalCost)}\n\nPlease arrange delivery for me!`;
    
    const waNumber = storeConfig.phone.replace('+', '');
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function whatsappCheckout() {
    if (shoppingCart.length === 0) {
        alert('Your cart is empty! Please add products before checking out.');
        return;
    }

    let message = `Hello ${storeConfig.title}! 👋\n\nI would like to place an order for the following items:\n\n`;

    shoppingCart.forEach((item, index) => {
        message += `${index + 1}. 📦 *${item.name}*\n   Code: _${item.code}_\n   Qty: *${item.quantity}* x ${formatPrice(item.price)}\n   Subtotal: *${formatPrice(item.price * item.quantity)}*\n\n`;
    });

    const total = calculateSubtotal();
    message += `━━━━━━━━━━━━━━━━━━━━━\n💳 *Grand Total:* *${formatPrice(total)}*\n━━━━━━━━━━━━━━━━━━━━━\n\nPlease confirm availability and details for shipping. Thank you!`;

    const waNumber = storeConfig.phone.replace('+', '');
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// 7. INTERACTIVE DETAIL MODAL
function openDetails(productId) {
    const product = productCatalog.find(p => p.id === productId);
    if (!product) return;

    // Load specs, details into modal
    document.getElementById('modal-product-img').src = product.image;
    document.getElementById('modal-product-img').alt = product.name;
    document.getElementById('modal-product-cat').innerText = product.category;
    document.getElementById('modal-product-code').innerText = product.code;
    document.getElementById('modal-product-title').innerText = product.name;
    document.getElementById('modal-product-price').innerText = formatPrice(product.price);
    document.getElementById('modal-product-desc').innerText = product.description;

    // Render Specifications
    const specsList = document.getElementById('modal-product-specs');
    specsList.innerHTML = '';
    product.specs.forEach(spec => {
        const li = document.createElement('li');
        li.innerText = spec;
        specsList.appendChild(li);
    });

    // Render Features
    const featuresTags = document.getElementById('modal-product-features');
    featuresTags.innerHTML = '';
    product.features.forEach(feat => {
        const span = document.createElement('span');
        span.className = 'feature-tag';
        span.innerText = feat;
        featuresTags.appendChild(span);
    });

    // Reset Modal Quantity
    const qtyVal = document.getElementById('modal-qty-val');
    qtyVal.innerText = '1';

    // Hook buttons inside modal with ID parameter closures
    const addCartBtn = document.getElementById('modal-add-cart-btn');
    addCartBtn.onclick = () => {
        const qty = parseInt(qtyVal.innerText);
        for(let i=0; i<qty; i++) {
            addToCart(product.id);
        }
        closeModal('product-modal');
    };

    const buyNowBtn = document.getElementById('modal-buy-now-btn');
    buyNowBtn.onclick = () => {
        const qty = parseInt(qtyVal.innerText);
        buyNowSingleWithQty(product.id, qty);
    };

    // Open Modal UI
    openModal('product-modal');
}

// Generic Modal togglers
function openModal(modalId) {
    document.getElementById(`${modalId}-overlay`).classList.add('active');
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden'; // block page scroll
}

function closeModal(modalId) {
    document.getElementById(`${modalId}-overlay`).classList.remove('active');
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = ''; // restore page scroll
}

// 8. EVENT BINDINGS & ON LOAD
document.addEventListener('DOMContentLoaded', () => {
    
    // Initializations
    initConfig();
    renderProducts();
    renderFeaturedProducts();
    
    // Global filter search
    const searchInput = document.getElementById('global-search');
    const sortSelect = document.getElementById('sort-select');
    
    let currentFilter = 'all';

    function runGlobalFilter() {
        const query = searchInput ? searchInput.value : '';
        const sort = sortSelect ? sortSelect.value : 'popular';
        renderProducts(currentFilter, sort, query);
    }

    if (searchInput) searchInput.addEventListener('input', runGlobalFilter);
    if (sortSelect) sortSelect.addEventListener('change', runGlobalFilter);

    // Grid filters tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-filter');
            runGlobalFilter();
        });
    });

    // Reset filters button
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (sortSelect) sortSelect.value = 'popular';
            currentFilter = 'all';
            tabs.forEach(t => {
                t.classList.remove('active');
                if (t.getAttribute('data-filter') === 'all') t.classList.add('active');
            });
            runGlobalFilter();
        });
    }

    // Category Quick Links (Header/Hero/Footer)
    const quickCards = document.querySelectorAll('.category-quick-card, .cat-link');
    quickCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const cat = card.getAttribute('data-cat');
            currentFilter = cat;
            tabs.forEach(t => {
                t.classList.remove('active');
                if (t.getAttribute('data-filter') === cat) t.classList.add('active');
            });
            runGlobalFilter();
            
            // Smooth scroll to catalog
            const catSec = document.getElementById('catalog');
            if (catSec) {
                catSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Cart side drawer actions
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-drawer-overlay');
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('whatsapp-checkout-btn');

    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    function hideCart() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeCartBtn) closeCartBtn.addEventListener('click', hideCart);
    if (cartOverlay) cartOverlay.addEventListener('click', hideCart);
    if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', whatsappCheckout);

    // Modal closes
    const pModalOverlay = document.getElementById('product-modal-overlay');
    const pModalClose = document.getElementById('close-product-modal');
    if (pModalOverlay) pModalOverlay.addEventListener('click', () => closeModal('product-modal'));
    if (pModalClose) pModalClose.addEventListener('click', () => closeModal('product-modal'));

    // Modal Qty controls
    const modalQtyVal = document.getElementById('modal-qty-val');
    const modalMinus = document.getElementById('modal-qty-minus');
    const modalPlus = document.getElementById('modal-qty-plus');

    if (modalMinus && modalPlus && modalQtyVal) {
        modalMinus.addEventListener('click', () => {
            let val = parseInt(modalQtyVal.innerText);
            if (val > 1) {
                modalQtyVal.innerText = val - 1;
            }
        });
        modalPlus.addEventListener('click', () => {
            let val = parseInt(modalQtyVal.innerText);
            modalQtyVal.innerText = val + 1;
        });
    }

    // Featured Slider controls
    const nextSlideBtn = document.getElementById('next-slide');
    const prevSlideBtn = document.getElementById('prev-slide');

    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            const slides = document.querySelectorAll('.slide');
            let nextIndex = (activeFeaturedSlide + 1) % slides.length;
            setSlide(nextIndex);
            startSlideTimer(); // reset interval
        });
    }
    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', () => {
            const slides = document.querySelectorAll('.slide');
            let prevIndex = (activeFeaturedSlide - 1 + slides.length) % slides.length;
            setSlide(prevIndex);
            startSlideTimer(); // reset interval
        });
    }

    // Settings Customization Form
    const openSettingsBtn = document.getElementById('open-settings');
    const settingsModal = document.getElementById('settings-modal');
    const settingsOverlay = document.getElementById('settings-modal-overlay');
    const closeSettingsBtn = document.getElementById('close-settings');
    const settingsForm = document.getElementById('settings-form');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');

    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => {
            document.getElementById('cfg-wa-number').value = storeConfig.phone;
            document.getElementById('cfg-currency-symbol').value = storeConfig.currency;
            document.getElementById('cfg-store-title').value = storeConfig.title;
            openModal('settings-modal');
        });
    }

    function hideSettings() {
        closeModal('settings-modal');
    }

    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', hideSettings);
    if (settingsOverlay) settingsOverlay.addEventListener('click', hideSettings);

    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = document.getElementById('cfg-wa-number').value;
            const currency = document.getElementById('cfg-currency-symbol').value;
            const title = document.getElementById('cfg-store-title').value;
            saveConfig(phone, currency, title);
            hideSettings();
        });
    }

    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            document.getElementById('cfg-wa-number').value = '+94707833043';
            document.getElementById('cfg-currency-symbol').value = 'LKR';
            document.getElementById('cfg-store-title').value = 'UNIVER SALE';
        });
    }

    // Initial Lucide activation
    lucide.createIcons();
});
