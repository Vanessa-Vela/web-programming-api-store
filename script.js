/**
 * SECTION 1: LOGIN AUTHENTICATION
 * This block manages the access control to the store.
 */
const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        // Stop the form from submitting to a server (Prevents page refresh)
        e.preventDefault(); 
        
        // Extract values from input elements
        const user = document.getElementById("username").value;
        const pass = document.getElementById("password").value;

        // Hardcoded check: If credentials match, grant access
        if (user === "admin" && pass === "1234") {
            localStorage.setItem("isLogged", "true"); // Save login state
            window.location.href = "dashboard.html"; // Move to the catalog
        } else {
            // Provide feedback if the user is wrong
            document.getElementById("error-msg").innerText = "Invalid credentials";
        }
    });
}

/**
 * SECTION 2: PRODUCT CATALOG (DASHBOARD)
 * Using DummyJSON API (https://dummyjson.com/products)
 */
let allProducts = []; // Global variable to hold the list for searching

async function loadProducts() {
    try {
        // Step 1: Request data from the API
        const res = await fetch('https://dummyjson.com/products');
        
        // Step 2: Convert response to JSON
        const data = await res.json(); 
        
        /** * TRICK: DummyJSON returns an object like { products: [...], total: 100 }.
         * We need to access the 'products' property specifically.
         */
        allProducts = data.products; 
        
        // Step 3: Draw the products on the screen
        displayProducts(allProducts);
    } catch (error) {
        console.error("Connection failed:", error);
    }
}

/**
 * Renders the UI cards for each product
 * @param {Array} products - Array of product objects
 */
function displayProducts(products) {
    const container = document.getElementById('results-grid');
    if (!container) return; // Guard clause: Stop if container doesn't exist
    container.innerHTML = ''; // Clean previous items

    products.forEach(item => {
        // Create a new div element in the browser's memory
        const card = document.createElement('div');
        card.className = 'product-card';
        
        /** * Using Template Literals (` `) to inject HTML.
         * DummyJSON uses 'thumbnail' for the main image.
         */
        card.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}">
            <div>
                <h3>${item.title}</h3>
                <p class="price">$${item.price}</p>
            </div>
        `;

        /**
         * INTER-PAGE COMMUNICATION:
         * We can't pass an object via URL, so we 'freeze' it into a string (stringify)
         * and store it in the browser's shared backpack (localStorage).
         */
        card.onclick = () => {
            localStorage.setItem('selectedProduct', JSON.stringify(item));
            window.location.href = 'detail.html';
        };

        // Add the finished card to the HTML document
        container.appendChild(card);
    });
}

/**
 * SEARCH LOGIC
 * Filters the list locally without calling the API again (Efficiency)
 */
const searchBtn = document.getElementById('search-btn');
if (searchBtn) {
    searchBtn.onclick = () => {
        const text = document.getElementById('search-input').value.toLowerCase();
        
        // Create a new list with only items matching the user's text
        const filtered = allProducts.filter(p => p.title.toLowerCase().includes(text));
        
        // Re-render the UI with only filtered items
        displayProducts(filtered);
    };
}

/**
 * SECTION 3: PRODUCT DETAIL
 * Recovers data and builds the specialized view.
 */
function showDetail() {
    // Step 1: Retrieve the string and 'thaw' it back into an object (parse)
    const product = JSON.parse(localStorage.getItem('selectedProduct'));
    const container = document.getElementById('detail-view');
    
    if (!product || !container) return;

    // Step 2: Inject full product information
    container.innerHTML = `
        <img src="${product.thumbnail}" style="width: 300px; object-fit: contain;">
        <div>
            <h1>${product.title}</h1>
            <p style="color: #64748b; text-transform: uppercase;">${product.category}</p>
            <p class="price" style="font-size: 2.5rem;">$${product.price}</p>
            <p>${product.description}</p>
            
            <p> Rating: ${product.rating} / 5</p>
            <p><strong>Stock:</strong> ${product.stock} units available</p>
            
            <button onclick="window.history.back()" style="background: #334155; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                ← Go Back
            </button>
        </div>
    `;
}