document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const tradeInCollection = document.getElementById('trade-in-collection');
  const tradeInProductType = document.getElementById('trade-in-product-type');
  const tradeInProduct = document.getElementById('trade-in-product');
  const desiredCollection = document.getElementById('desired-collection');
  const desiredProductType = document.getElementById('desired-product-type');
  const desiredProduct = document.getElementById('desired-product');
  
  // Update API endpoint base URL
  const API_BASE_URL = 'https://shopify-app-server.fly.dev/api';
  
  // Update the fetch configuration
  const fetchConfig = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    credentials: 'omit'
  };
  
  // Fetch collections on load
  async function loadCollections() {
    try {
      const response = await fetch(`${API_BASE_URL}/collections`, fetchConfig);
      if (!response.ok) throw new Error('Failed to fetch collections');
      const collections = await response.json();
      
      // Populate trade-in collections (FOR_TRADE)
      tradeInCollection.innerHTML = '<option value="">Selectează colecția</option>';
      collections
        .filter(collection => collection.productSaleTypes.includes('FOR_TRADE'))
        .forEach(collection => {
          tradeInCollection.innerHTML += `
            <option value="${collection.id}">${collection.name}</option>
          `;
        });

      // Populate desired collections (FOR_SALE)
      desiredCollection.innerHTML = '<option value="">Selectează colecția</option>';
      collections
        .filter(collection => collection.productSaleTypes.includes('FOR_SALE'))
        .forEach(collection => {
          desiredCollection.innerHTML += `
            <option value="${collection.id}">${collection.name}</option>
          `;
        });
    } catch (error) {
      console.error('Error fetching collections:', error);
      showError('Failed to load collections');
    }
  }

  // Update product types when trade-in collection changes
  tradeInCollection.addEventListener('change', async function() {
    const collectionId = this.value;
    tradeInProductType.disabled = true;
    tradeInProduct.disabled = true;
    
    if (!collectionId) {
      tradeInProductType.innerHTML = '<option value="">Selectează tipul produsului</option>';
      tradeInProduct.innerHTML = '<option value="">Selectează produsul</option>';
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/product-types/collection/${collectionId}?type=FOR_TRADE`,
        fetchConfig
      );
      if (!response.ok) throw new Error('Failed to fetch product types');
      const productTypes = await response.json();
      
      tradeInProductType.innerHTML = '<option value="">Selectează tipul produsului</option>';
      productTypes.forEach(productType => {
        tradeInProductType.innerHTML += `
          <option value="${productType.id}">${productType.name}</option>
        `;
      });
      tradeInProductType.disabled = false;
    } catch (error) {
      console.error('Error fetching product types:', error);
      showError('Failed to load product types');
    }
  });

  // Update products when product type changes
  tradeInProductType.addEventListener('change', async function() {
    const productTypeId = this.value;
    tradeInProduct.disabled = true;
    
    if (!productTypeId) {
      tradeInProduct.innerHTML = '<option value="">Selectează produsul</option>';
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/type/${productTypeId}?type=FOR_TRADE`,
        fetchConfig
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      
      tradeInProduct.innerHTML = '<option value="">Selectează produsul</option>';
      products.forEach(product => {
        tradeInProduct.innerHTML += `
          <option value="${product.id}" data-price="${product.price}">
            ${product.name} - ${product.price.toFixed(2)} lei
          </option>
        `;
      });
      tradeInProduct.disabled = false;
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    }
  });

  // Add error handling function
  function showError(message) {
    alert(message);
  }

  // Update price displays when products are selected
  tradeInProduct.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const price = selectedOption.dataset.price || '0';
    document.getElementById('trade-in-price').querySelector('span').textContent = `${price} lei`;
    updateSummary();
  });

  desiredProduct.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const price = selectedOption.dataset.price || '0';
    document.getElementById('desired-price').querySelector('span').textContent = `${price} lei`;
    updateSummary();
  });

  function updateSummary() {
    const tradeInValue = parseFloat(document.getElementById('trade-in-price').querySelector('span').textContent) || 0;
    const newDevicePrice = parseFloat(document.getElementById('desired-price').querySelector('span').textContent) || 0;
    
    document.getElementById('summary-trade-value').textContent = `${tradeInValue.toFixed(2)} lei`;
    document.getElementById('summary-new-price').textContent = `${newDevicePrice.toFixed(2)} lei`;
    document.getElementById('summary-difference').textContent = `${Math.max(0, newDevicePrice - tradeInValue).toFixed(2)} lei`;
  }

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

  // Handle form submission
  form.onsubmit = async function(e) {
    e.preventDefault();
    
    const data = {
      name: document.getElementById('customer-name').value,
      phoneNumber: document.getElementById('customer-phone').value,
      productId: document.getElementById('desired-product').value
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
      console.error('Error:', error);
      showError('A apărut o eroare. Vă rugăm încercați din nou.');
    }
  }

  // Update products when desired product type changes
  desiredProductType.addEventListener('change', async function() {
    const productTypeId = this.value;
    desiredProduct.disabled = true;
    
    if (!productTypeId) {
      desiredProduct.innerHTML = '<option value="">Selectează produsul</option>';
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/type/${productTypeId}?type=FOR_SALE`,
        fetchConfig
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      
      desiredProduct.innerHTML = '<option value="">Selectează produsul</option>';
      products.forEach(product => {
        desiredProduct.innerHTML += `
          <option value="${product.id}" data-price="${product.price}">
            ${product.name} - ${product.price.toFixed(2)} lei
          </option>
        `;
      });
      desiredProduct.disabled = false;
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    }
  });

  // Update desired product types when collection changes
  desiredCollection.addEventListener('change', async function() {
    const collectionId = this.value;
    desiredProductType.disabled = true;
    desiredProduct.disabled = true;
    
    if (!collectionId) {
      desiredProductType.innerHTML = '<option value="">Selectează tipul produsului</option>';
      desiredProduct.innerHTML = '<option value="">Selectează produsul</option>';
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/product-types/collection/${collectionId}?type=FOR_SALE`,
        fetchConfig
      );
      if (!response.ok) throw new Error('Failed to fetch product types');
      const productTypes = await response.json();
      
      desiredProductType.innerHTML = '<option value="">Selectează tipul produsului</option>';
      productTypes.forEach(productType => {
        desiredProductType.innerHTML += `
          <option value="${productType.id}">${productType.name}</option>
        `;
      });
      desiredProductType.disabled = false;
    } catch (error) {
      console.error('Error fetching product types:', error);
      showError('Failed to load product types');
    }
  });

  // Initialize
  loadCollections();
}); 