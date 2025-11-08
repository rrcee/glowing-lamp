// ============================================
// SARAL - Products Management
// ============================================

const Products = {
    init() {
        // Products doesn't need initialization on app start
    },
    
    render() {
        const container = document.getElementById('screen-products');
        const business = Storage.getCurrentBusiness();
        
        if (!business) {
            container.innerHTML = '<p>No business selected</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="products-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Product Management</h3>
                    <button class="btn btn-primary" onclick="Products.showAddModal()">
                        + Add Product
                    </button>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px; max-width: 400px;">
                    <input type="text" id="products-search" class="form-input" placeholder="Search products..." oninput="Products.searchProducts(this.value)">
                </div>
                
                <div id="products-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                    ${this.renderProducts()}
                </div>
            </div>
        `;
    },
    
    renderProducts() {
        const business = Storage.getCurrentBusiness();
        const products = Storage.getProducts(business.id);
        
        if (products.length === 0) {
            return `
                <div class="glass-card" style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">No products added yet</p>
                    <button class="btn btn-primary" onclick="Products.showAddModal()">Add Your First Product</button>
                </div>
            `;
        }
        
        return products.map(product => `
            <div class="product-card glass-card hover-lift" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <h4 style="margin: 0;">${product.name}</h4>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary" style="padding: 6px 10px;" onclick="Products.showEditModal('${product.id}')">✏️</button>
                        <button class="btn btn-danger" style="padding: 6px 10px;" onclick="Products.deleteProduct('${product.id}')">🗑️</button>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px;">${product.category || 'Uncategorized'}</div>
                    <div style="font-weight: 700; font-size: 1.2rem;">${Utils.formatCurrency(product.price)}</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid var(--glass-border);">
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">SKU: ${product.sku || 'N/A'}</span>
                    <span style="font-weight: 600;">Stock: ${product.stock || 0}</span>
                </div>
            </div>
        `).join('');
    },
    
    searchProducts(query) {
        const business = Storage.getCurrentBusiness();
        const products = Storage.getProducts(business.id);
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase())) ||
            (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
        );
        
        const container = document.getElementById('products-list');
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <p style="color: var(--text-secondary);">No products found</p>
                </div>
            `;
        } else {
            container.innerHTML = filtered.map(product => `
                <div class="product-card glass-card hover-lift" style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <h4 style="margin: 0;">${product.name}</h4>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary" style="padding: 6px 10px;" onclick="Products.showEditModal('${product.id}')">✏️</button>
                            <button class="btn btn-danger" style="padding: 6px 10px;" onclick="Products.deleteProduct('${product.id}')">🗑️</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px;">${product.category || 'Uncategorized'}</div>
                        <div style="font-weight: 700; font-size: 1.2rem;">${Utils.formatCurrency(product.price)}</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid var(--glass-border);">
                        <span style="color: var(--text-secondary); font-size: 0.9rem;">SKU: ${product.sku || 'N/A'}</span>
                        <span style="font-weight: 600;">Stock: ${product.stock || 0}</span>
                    </div>
                </div>
            `).join('');
        }
    },
    
    showAddModal() {
        const modal = document.getElementById('modal-container');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-content glass-card" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Add New Product</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <form id="product-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="form-group">
                            <label>Product Name *</label>
                            <input type="text" id="product-name" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label>SKU</label>
                            <input type="text" id="product-sku" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label>Category</label>
                            <select id="product-category" class="form-select">
                                <option value="">Select Category</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Food">Food</option>
                                <option value="Beverages">Beverages</option>
                                <option value="Stationery">Stationery</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Price *</label>
                            <input type="number" id="product-price" class="form-input" step="0.01" min="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Stock Quantity</label>
                            <input type="number" id="product-stock" class="form-input" min="0" value="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="product-description" class="form-textarea" rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Product</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
    },
    
    showEditModal(productId) {
        const business = Storage.getCurrentBusiness();
        const product = Storage.getProducts(business.id).find(p => p.id === productId);
        
        if (!product) return;
        
        const modal = document.getElementById('modal-container');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-content glass-card" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Edit Product</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <form id="product-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <input type="hidden" id="product-id" value="${product.id}">
                        
                        <div class="form-group">
                            <label>Product Name *</label>
                            <input type="text" id="product-name" class="form-input" value="${product.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>SKU</label>
                            <input type="text" id="product-sku" class="form-input" value="${product.sku || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label>Category</label>
                            <select id="product-category" class="form-select">
                                <option value="">Select Category</option>
                                <option value="Electronics" ${product.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
                                <option value="Clothing" ${product.category === 'Clothing' ? 'selected' : ''}>Clothing</option>
                                <option value="Food" ${product.category === 'Food' ? 'selected' : ''}>Food</option>
                                <option value="Beverages" ${product.category === 'Beverages' ? 'selected' : ''}>Beverages</option>
                                <option value="Stationery" ${product.category === 'Stationery' ? 'selected' : ''}>Stationery</option>
                                <option value="Other" ${product.category === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Price *</label>
                            <input type="number" id="product-price" class="form-input" step="0.01" min="0" value="${product.price || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Stock Quantity</label>
                            <input type="number" id="product-stock" class="form-input" min="0" value="${product.stock || 0}">
                        </div>
                        
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="product-description" class="form-textarea" rows="3">${product.description || ''}</textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Product</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
    },
    
    saveProduct() {
        const business = Storage.getCurrentBusiness();
        const id = document.getElementById('product-id')?.value;
        const name = document.getElementById('product-name').value.trim();
        const sku = document.getElementById('product-sku').value.trim();
        const category = document.getElementById('product-category').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value) || 0;
        const description = document.getElementById('product-description').value.trim();
        
        // Validate
        if (!name) {
            Utils.showNotification('Product name is required', 'error');
            return;
        }
        
        if (isNaN(price) || price <= 0) {
            Utils.showNotification('Valid price is required', 'error');
            return;
        }
        
        // Create product object
        const product = {
            id: id || Utils.generateId(),
            businessId: business.id,
            name,
            sku: sku || undefined,
            category: category || undefined,
            price,
            stock,
            description: description || undefined,
            createdAt: id ? undefined : new Date().toISOString()
        };
        
        // Save product
        Storage.saveProduct(product);
        
        // Close modal
        document.querySelector('.modal')?.remove();
        
        // Refresh products list
        this.render();
        
        Utils.showNotification(id ? 'Product updated successfully!' : 'Product added successfully!', 'success');
    },
    
    async deleteProduct(productId) {
        const confirmed = await Utils.confirm('Are you sure you want to delete this product?');
        
        if (confirmed) {
            Storage.deleteProduct(productId);
            this.render();
            Utils.showNotification('Product deleted successfully', 'success');
        }
    }
};

// Make globally available
window.Products = Products;
