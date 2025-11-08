// ============================================
// SARAL - Inventory Management
// ============================================

const Inventory = {
    init() {
        // Inventory doesn't need initialization on app start
    },
    
    render() {
        const container = document.getElementById('screen-inventory');
        const business = Storage.getCurrentBusiness();
        
        if (!business) {
            container.innerHTML = '<p>No business selected</p>';
            return;
        }
        
        const products = Storage.getProducts(business.id);
        const lowStockThreshold = Storage.getSettings().lowStockThreshold || 10;
        
        // Categorize products
        const inStock = products.filter(p => (p.stock || 0) > lowStockThreshold);
        const lowStock = products.filter(p => (p.stock || 0) <= lowStockThreshold && (p.stock || 0) > 0);
        const outOfStock = products.filter(p => (p.stock || 0) <= 0);
        
        container.innerHTML = `
            <div class="inventory-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Inventory Management</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="Inventory.showAddStockModal()">
                            + Add Stock
                        </button>
                        <button class="btn btn-secondary" onclick="Inventory.exportInventory()">
                            Export
                        </button>
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px; max-width: 400px;">
                    <input type="text" id="inventory-search" class="form-input" placeholder="Search inventory..." oninput="Inventory.searchInventory(this.value)">
                </div>
                
                <!-- Inventory Summary -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    ${this.renderInventorySummary(inStock.length, lowStock.length, outOfStock.length)}
                </div>
                
                <!-- Inventory Tabs -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; gap: 5px; margin-bottom: 15px; flex-wrap: wrap;">
                        <button class="btn btn-secondary" onclick="Inventory.showTab('all')" id="tab-all" style="background: var(--primary);">
                            All Products (${products.length})
                        </button>
                        <button class="btn btn-secondary" onclick="Inventory.showTab('instock')" id="tab-instock">
                            In Stock (${inStock.length})
                        </button>
                        <button class="btn btn-secondary" onclick="Inventory.showTab('lowstock')" id="tab-lowstock">
                            Low Stock (${lowStock.length})
                        </button>
                        <button class="btn btn-secondary" onclick="Inventory.showTab('outofstock')" id="tab-outofstock">
                            Out of Stock (${outOfStock.length})
                        </button>
                    </div>
                    
                    <div id="inventory-list">
                        ${this.renderInventoryList(products)}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderInventorySummary(inStock, lowStock, outOfStock) {
        return `
            <div class="stat-card glass-card" style="border-left: 4px solid var(--success);">
                <div style="font-size: 2rem; margin-bottom: 10px;">📦</div>
                <div style="font-size: 1.5rem; font-weight: 700;">${inStock}</div>
                <div style="color: var(--text-secondary);">In Stock</div>
            </div>
            
            <div class="stat-card glass-card" style="border-left: 4px solid var(--warning);">
                <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
                <div style="font-size: 1.5rem; font-weight: 700;">${lowStock}</div>
                <div style="color: var(--text-secondary);">Low Stock</div>
            </div>
            
            <div class="stat-card glass-card" style="border-left: 4px solid var(--danger);">
                <div style="font-size: 2rem; margin-bottom: 10px;">❌</div>
                <div style="font-size: 1.5rem; font-weight: 700;">${outOfStock}</div>
                <div style="color: var(--text-secondary);">Out of Stock</div>
            </div>
        `;
    },
    
    renderInventoryList(products) {
        if (products.length === 0) {
            return `
                <div class="glass-card" style="text-align: center; padding: 40px;">
                    <p style="color: var(--text-secondary);">No products found</p>
                </div>
            `;
        }
        
        const lowStockThreshold = Storage.getSettings().lowStockThreshold || 10;
        
        return `
            <div class="glass-card" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Product</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Category</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-secondary);">Current Stock</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-secondary);">Price</th>
                            <th style="padding: 12px; text-align: center; color: var(--text-secondary);">Status</th>
                            <th style="padding: 12px; text-align: center; color: var(--text-secondary);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => {
                            const stock = product.stock || 0;
                            let status, statusClass;
                            
                            if (stock <= 0) {
                                status = 'Out of Stock';
                                statusClass = 'danger';
                            } else if (stock <= lowStockThreshold) {
                                status = 'Low Stock';
                                statusClass = 'warning';
                            } else {
                                status = 'In Stock';
                                statusClass = 'success';
                            }
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <td style="padding: 12px;">
                                        <div style="font-weight: 600;">${product.name}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem;">SKU: ${product.sku || 'N/A'}</div>
                                    </td>
                                    <td style="padding: 12px;">${product.category || 'Uncategorized'}</td>
                                    <td style="padding: 12px; text-align: right; font-weight: 600;">${stock}</td>
                                    <td style="padding: 12px; text-align: right;">${Utils.formatCurrency(product.price)}</td>
                                    <td style="padding: 12px; text-align: center;">
                                        <span style="padding: 4px 12px; border-radius: 12px; background: var(--${statusClass}); color: white; font-size: 0.85rem;">
                                            ${status}
                                        </span>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <button class="btn btn-secondary" style="padding: 6px 10px; margin-right: 5px;" onclick="Inventory.showAdjustStockModal('${product.id}')">
                                            Adjust
                                        </button>
                                        <button class="btn btn-danger" style="padding: 6px 10px;" onclick="Inventory.deleteProduct('${product.id}')">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    showTab(tab) {
        // Update active tab buttons
        document.querySelectorAll('[id^="tab-"]').forEach(btn => {
            btn.style.background = '';
        });
        document.getElementById(`tab-${tab}`).style.background = 'var(--primary)';
        
        // Filter and display products
        const business = Storage.getCurrentBusiness();
        const products = Storage.getProducts(business.id);
        const lowStockThreshold = Storage.getSettings().lowStockThreshold || 10;
        
        let filteredProducts;
        switch (tab) {
            case 'instock':
                filteredProducts = products.filter(p => (p.stock || 0) > lowStockThreshold);
                break;
            case 'lowstock':
                filteredProducts = products.filter(p => (p.stock || 0) <= lowStockThreshold && (p.stock || 0) > 0);
                break;
            case 'outofstock':
                filteredProducts = products.filter(p => (p.stock || 0) <= 0);
                break;
            default:
                filteredProducts = products;
        }
        
        document.getElementById('inventory-list').innerHTML = this.renderInventoryList(filteredProducts);
    },
    
    searchInventory(query) {
        const business = Storage.getCurrentBusiness();
        const products = Storage.getProducts(business.id);
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(query.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
        );
        
        document.getElementById('inventory-list').innerHTML = this.renderInventoryList(filtered);
    },
    
    showAddStockModal() {
        const modal = document.getElementById('modal-container');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-content glass-card" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Add Stock to Product</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <form id="add-stock-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="form-group">
                            <label>Select Product *</label>
                            <select id="stock-product" class="form-select" required>
                                <option value="">Choose a product</option>
                                ${this.renderProductOptions()}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Quantity to Add *</label>
                            <input type="number" id="stock-quantity" class="form-input" min="1" value="1" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Reason for Adjustment</label>
                            <select id="stock-reason" class="form-select">
                                <option value="restock">Restock</option>
                                <option value="return">Customer Return</option>
                                <option value="correction">Stock Correction</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Notes (Optional)</label>
                            <textarea id="stock-notes" class="form-textarea" rows="2"></textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Stock</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('add-stock-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addStock();
        });
    },
    
    renderProductOptions() {
        const business = Storage.getCurrentBusiness();
        const products = Storage.getProducts(business.id);
        return products.map(product => `
            <option value="${product.id}">${product.name} (Current: ${product.stock || 0})</option>
        `).join('');
    },
    
    addStock() {
        const productId = document.getElementById('stock-product').value;
        const quantity = parseInt(document.getElementById('stock-quantity').value);
        const reason = document.getElementById('stock-reason').value;
        const notes = document.getElementById('stock-notes').value.trim();
        
        if (!productId || isNaN(quantity) || quantity <= 0) {
            Utils.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        const business = Storage.getCurrentBusiness();
        const product = Storage.getProducts(business.id).find(p => p.id === productId);
        
        if (!product) {
            Utils.showNotification('Product not found', 'error');
            return;
        }
        
        // Update stock
        product.stock = (product.stock || 0) + quantity;
        Storage.saveProduct(product);
        
        // Close modal
        document.querySelector('.modal')?.remove();
        
        // Refresh inventory
        this.render();
        
        Utils.showNotification(`Added ${quantity} units to ${product.name}`, 'success');
    },
    
    showAdjustStockModal(productId) {
        const business = Storage.getCurrentBusiness();
        const product = Storage.getProducts(business.id).find(p => p.id === productId);
        
        if (!product) return;
        
        const modal = document.getElementById('modal-container');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-content glass-card" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Adjust Stock for ${product.name}</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <form id="adjust-stock-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <input type="hidden" id="adjust-product-id" value="${product.id}">
                        
                        <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px;">
                            <div style="font-size: 1.2rem; font-weight: 700;">Current Stock: ${product.stock || 0}</div>
                        </div>
                        
                        <div class="form-group">
                            <label>New Stock Quantity *</label>
                            <input type="number" id="adjust-quantity" class="form-input" min="0" value="${product.stock || 0}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Reason for Adjustment</label>
                            <select id="adjust-reason" class="form-select">
                                <option value="restock">Restock</option>
                                <option value="sale">Sale Correction</option>
                                <option value="damage">Damaged Items</option>
                                <option value="theft">Theft/Loss</option>
                                <option value="return">Customer Return</option>
                                <option value="correction">Stock Correction</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Notes (Optional)</label>
                            <textarea id="adjust-notes" class="form-textarea" rows="2"></textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Stock</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('adjust-stock-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adjustStock();
        });
    },
    
    adjustStock() {
        const productId = document.getElementById('adjust-product-id').value;
        const newQuantity = parseInt(document.getElementById('adjust-quantity').value);
        const reason = document.getElementById('adjust-reason').value;
        const notes = document.getElementById('adjust-notes').value.trim();
        
        if (isNaN(newQuantity) || newQuantity < 0) {
            Utils.showNotification('Please enter a valid quantity', 'error');
            return;
        }
        
        const business = Storage.getCurrentBusiness();
        const product = Storage.getProducts(business.id).find(p => p.id === productId);
        
        if (!product) {
            Utils.showNotification('Product not found', 'error');
            return;
        }
        
        // Update stock
        const oldQuantity = product.stock || 0;
        product.stock = newQuantity;
        Storage.saveProduct(product);
        
        // Close modal
        document.querySelector('.modal')?.remove();
        
        // Refresh inventory
        this.render();
        
        Utils.showNotification(`Stock for ${product.name} updated from ${oldQuantity} to ${newQuantity}`, 'success');
    },
    
    async deleteProduct(productId) {
        const confirmed = await Utils.confirm('Are you sure you want to delete this product? This action cannot be undone.');
        
        if (confirmed) {
            Storage.deleteProduct(productId);
            this.render();
            Utils.showNotification('Product deleted successfully', 'success');
        }
    },
    
    exportInventory() {
        const business = Storage.getCurrentBusiness();
        const products = Storage.getProducts(business.id);
        
        if (products.length === 0) {
            Utils.showNotification('No products to export', 'error');
            return;
        }
        
        // Prepare data for export
        const exportData = products.map(product => ({
            'Product Name': product.name,
            'SKU': product.sku || '',
            'Category': product.category || '',
            'Price': product.price,
            'Current Stock': product.stock || 0,
            'Status': (product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'
        }));
        
        Utils.exportToCSV(exportData, `inventory-${new Date().toISOString().split('T')[0]}.csv`);
        Utils.showNotification('Inventory exported successfully!', 'success');
    }
};

// Make globally available
window.Inventory = Inventory;