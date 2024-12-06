document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');
  const tradeInCategory = document.getElementById('trade-in-category');
  const tradeInProduct = document.getElementById('trade-in-product');
  const desiredCategory = document.getElementById('desired-category');
  
  // Update API endpoint base URL
  const API_BASE_URL = 'https://shopify-app-server.fly.dev/api'; // Updated to production URL
  
  // Update the fetch configuration
  const fetchConfig = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    credentials: 'omit'
  };
  
  // Fetch categories on load
  async function loadCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/collections`, fetchConfig);
      if (!response.ok) throw new Error('Failed to fetch collections');
      const collections = await response.json();
      
      tradeInCategory.innerHTML = '<option value="">Selectează categoria</option>';
      collections.forEach(collection => {
        tradeInCategory.innerHTML += `
          <option value="${collection.id}">${collection.name}</option>
        `;
      });
    } catch (error) {
      console.error('Error fetching collections:', error);
      showError('Failed to load categories');
    }
  }

  // Update product options when category changes
  tradeInCategory.addEventListener('change', async function() {
    const collectionId = this.value;
    tradeInProduct.disabled = true;
    
    if (!collectionId) {
      tradeInProduct.innerHTML = '<option value="">Selectează produsul</option>';
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/collections/${collectionId}/products?type=FOR_TRADE`,
        fetchConfig
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      
      tradeInProduct.innerHTML = '<option value="">Selectează produsul</option>';
      products.forEach(product => {
        tradeInProduct.innerHTML += `
          <option value="${product.id}" data-price="${product.price}">
            ${product.name} - $${product.price.toFixed(2)}
          </option>
        `;
      });
      tradeInProduct.disabled = false;
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    }
  });

  // Load desired products (FOR_SALE type)
  async function loadDesiredProducts() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?type=FOR_SALE`,
        fetchConfig
      );
      if (!response.ok) throw new Error('Failed to fetch desired products');
      const products = await response.json();
      
      desiredCategory.innerHTML = '<option value="">Selectează produsul</option>';
      products.forEach(product => {
        desiredCategory.innerHTML += `
          <option value="${product.id}" data-price="${product.price}">
            ${product.name} - $${product.price.toFixed(2)}
          </option>
        `;
      });
    } catch (error) {
      console.error('Error fetching desired products:', error);
      showError('Failed to load available products');
    }
  }

  // Add error handling function
  function showError(message) {
    // You can implement this based on your UI needs
    alert(message);
  }

  // Rest of the code remains the same...
  tradeInProduct.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const price = selectedOption.dataset.price || '0';
    document.getElementById('trade-in-price').querySelector('span').textContent = price;
    updateSummary();
  });

  desiredCategory.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const price = selectedOption.dataset.price || '0';
    document.getElementById('desired-price').querySelector('span').textContent = price;
    updateSummary();
  });

  function updateSummary() {
    const tradeInValue = parseFloat(document.getElementById('trade-in-price').querySelector('span').textContent) || 0;
    const newDevicePrice = parseFloat(document.getElementById('desired-price').querySelector('span').textContent) || 0;
    
    document.getElementById('summary-trade-value').textContent = `$${tradeInValue.toFixed(2)}`;
    document.getElementById('summary-new-price').textContent = `$${newDevicePrice.toFixed(2)}`;
    document.getElementById('summary-difference').textContent = `$${Math.max(0, newDevicePrice - tradeInValue).toFixed(2)}`;
  }

  // Initialize
  loadCategories();
  loadDesiredProducts();

  // Modal handling
  const modal = document.getElementById('trade-in-modal');
  const submitButton = document.getElementById('submit-trade-in');
  const closeButton = document.getElementsByClassName('close')[0];
  const form = document.getElementById('trade-in-form');

  submitButton.onclick = function() {
    modal.style.display = "block";
  }

  closeButton.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  form.onsubmit = async function(e) {
    e.preventDefault();
    
    const data = {
      name: document.getElementById('customer-name').value,
      phoneNumber: document.getElementById('customer-phone').value,
      productId: document.getElementById('desired-category').value
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Cererea a fost trimisă cu succes!');
        modal.style.display = "none";
        form.reset();
      } else {
        throw new Error('Something went wrong');
      }
    } catch (error) {
      alert('A apărut o eroare. Vă rugăm încercați din nou.');
      console.error('Error:', error);
    }
  }
}); 