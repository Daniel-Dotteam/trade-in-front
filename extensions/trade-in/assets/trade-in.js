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

  // Update product types when collection changes (for both trade-in and desired)
  async function loadProductTypes(collectionId, type, targetElement) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product-types/collection/${collectionId}?type=${type}`,
        fetchConfig
      );
      if (!response.ok) throw new Error('Failed to fetch product types');
      const productTypes = await response.json();
      
      targetElement.innerHTML = '<option value="">Selectează tipul produsului</option>';
      productTypes.forEach(productType => {
        targetElement.innerHTML += `
          <option value="${productType.id}">${productType.name}</option>
        `;
      });
      targetElement.disabled = false;
    } catch (error) {
      console.error('Error fetching product types:', error);
      showError('Failed to load product types');
    }
  }

  // Update products when product type changes (for both trade-in and desired)
  async function loadProducts(productTypeId, type, targetElement) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/type/${productTypeId}?type=${type}`,
        fetchConfig
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      
      targetElement.innerHTML = '<option value="">Selectează produsul</option>';
      products.forEach(product => {
        targetElement.innerHTML += `
          <option value="${product.id}" data-price="${product.price}">
            ${product.name} - ${product.price.toFixed(2)} lei
          </option>
        `;
      });
      targetElement.disabled = false;
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    }
  }

  // Event listeners for trade-in collection
  tradeInCollection.addEventListener('change', async function() {
    const collectionId = this.value;
    tradeInProductType.disabled = true;
    tradeInProduct.disabled = true;
    
    if (!collectionId) {
      tradeInProductType.innerHTML = '<option value="">Selectează tipul produsului</option>';
      tradeInProduct.innerHTML = '<option value="">Selectează produsul</option>';
      return;
    }

    await loadProductTypes(collectionId, 'FOR_TRADE', tradeInProductType);
  });

  // Event listeners for desired collection
  desiredCollection.addEventListener('change', async function() {
    const collectionId = this.value;
    desiredProductType.disabled = true;
    desiredProduct.disabled = true;
    
    if (!collectionId) {
      desiredProductType.innerHTML = '<option value="">Selectează tipul produsului</option>';
      desiredProduct.innerHTML = '<option value="">Selectează produsul</option>';
      return;
    }

    await loadProductTypes(collectionId, 'FOR_SALE', desiredProductType);
  });

  // Event listeners for product types
  tradeInProductType.addEventListener('change', async function() {
    const productTypeId = this.value;
    tradeInProduct.disabled = true;
    
    if (!productTypeId) {
      tradeInProduct.innerHTML = '<option value="">Selectează produsul</option>';
      return;
    }

    await loadProducts(productTypeId, 'FOR_TRADE', tradeInProduct);
  });

  desiredProductType.addEventListener('change', async function() {
    const productTypeId = this.value;
    desiredProduct.disabled = true;
    
    if (!productTypeId) {
      desiredProduct.innerHTML = '<option value="">Selectează produsul</option>';
      return;
    }

    await loadProducts(productTypeId, 'FOR_SALE', desiredProduct);
  });

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

  // Get modal elements
  const modal = document.getElementById('trade-in-modal');
  const submitTradeInBtn = document.getElementById('submit-trade-in');
  const closeBtn = modal.querySelector('.close');
  const cancelBtn = modal.querySelector('.cancel-button');
  const form = document.getElementById('trade-in-form');

  // Enable submit button when both products are selected
  function updateSubmitButton() {
    const tradeInSelected = tradeInProduct.value;
    const desiredSelected = desiredProduct.value;
    submitTradeInBtn.disabled = !(tradeInSelected && desiredSelected);
  }

  // Add listeners to product selects
  tradeInProduct.addEventListener('change', updateSubmitButton);
  desiredProduct.addEventListener('change', updateSubmitButton);

  // Open modal when clicking submit button
  submitTradeInBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const tradeInSelected = tradeInProduct.options[tradeInProduct.selectedIndex];
    const desiredSelected = desiredProduct.options[desiredProduct.selectedIndex];
    
    // Update modal details
    document.getElementById('modal-trade-in-details').textContent = tradeInSelected.text;
    document.getElementById('modal-desired-details').textContent = desiredSelected.text;
    document.getElementById('modal-total').textContent = document.getElementById('summary-difference').textContent;
    
    // Update how we show the modal
    modal.style.display = 'flex';
  });

  // Close modal functions
  function closeModal() {
    modal.style.display = 'none';
    form.reset(); // Optional: reset form when closing
  }

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Add this function near your other utility functions
  function showSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    successMessage.classList.add('show');
    
    // Hide after 2 seconds and reset form
    setTimeout(() => {
      successMessage.classList.remove('show');
      setTimeout(() => {
        resetForm();
      }, 300); // Wait for fade out animation
    }, 2000);
  }

  // Update the form submission success handling
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading spinner
    document.getElementById('loading-spinner').style.display = 'flex';
    
    // Validate required fields
    if (!tradeInProduct.value || !desiredProduct.value) {
      showError('Te rugăm să selectezi ambele produse');
      document.getElementById('loading-spinner').style.display = 'none';
      return;
    }

    const customerName = document.getElementById('customer-name').value.trim();
    const customerPhone = document.getElementById('customer-phone').value.trim();

    if (!customerName) {
      showError('Te rugăm să completezi numele');
      document.getElementById('loading-spinner').style.display = 'none';
      return;
    }

    if (!customerPhone) {
      showError('Te rugăm să completezi numărul de telefon');
      document.getElementById('loading-spinner').style.display = 'none';
      return;
    }

    // Update the data object to match server expectations
    const data = {
      name: customerName,                    // Changed from customerName
      phoneNumber: customerPhone,            // Changed from customerPhone
      saleProductId: desiredProduct.value,   // This stays the same
      tradeProductId: tradeInProduct.value,  // This stays the same
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la trimiterea comenzii');
      }

      await response.json();
      
      // Close modal
      closeModal();
      
      // Show success message instead of alert
      showSuccessMessage();
      
    } catch (error) {
      console.error('Error submitting order:', error);
      showError(error.message || 'Eroare la trimiterea comenzii');
    } finally {
      // Hide loading spinner
      document.getElementById('loading-spinner').style.display = 'none';
    }
  });

  // Helper function to reset the form and all selections
  function resetForm() {
    // Reset form
    form.reset();
    
    // Reset all dropdowns
    tradeInCollection.value = '';
    tradeInProductType.value = '';
    tradeInProduct.value = '';
    desiredCollection.value = '';
    desiredProductType.value = '';
    desiredProduct.value = '';
    
    // Disable dependent dropdowns
    tradeInProductType.disabled = true;
    tradeInProduct.disabled = true;
    desiredProductType.disabled = true;
    desiredProduct.disabled = true;
    
    // Reset price displays
    document.getElementById('trade-in-price').querySelector('span').textContent = '0 lei';
    document.getElementById('desired-price').querySelector('span').textContent = '0 lei';
    
    // Update summary
    updateSummary();
  }

  // Improved error handling
  function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = errorDiv.querySelector('p');
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
    
    // Scroll error into view
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Hide error after 5 seconds
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  // Add close button handler for error message
  document.querySelector('#error-message .close').addEventListener('click', function() {
    document.getElementById('error-message').style.display = 'none';
  });

  // Initialize
  loadCollections();
}); 