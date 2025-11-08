// ============================================
// SARAL - Point of Sale (POS)
// ============================================

const POS = {
    cart: [],
    
    init() {
        // POS doesn't need initialization on app start
    },
    
    render() {
        const container = document.getElementById('screen-pos');
        const business = Storage.getCurrentBusiness();
        
        if (!business) {
            container.innerHTML = '<p>No business selected</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="pos-container" style="display: grid; grid-template-columns: 1fr 350px; gap: 20px; height: calc(100vh - 180px);">
                <!-- Products Section -->
                <div class="glass-card" style="overflow-y: auto;">
                    <h3 style="margin-bottom: 20px;">Select Products</h3>
                    <div class="form-group" style="margin-bottom: 20px;">
                        <input type="text" id="pos-search" class="form-input" placeholder="Search products..." oninput="POS.searchProducts(this.value)">
                    </div>
                    <div id="pos-products-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px;">
                        ${this.renderProducts()}
                    </div>
                </div>
                
                <!-- Cart Section -->
                <div class="glass-card" style="display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 20px;">Cart</h3>
                    <div id="pos-cart-items" style="flex: 1; overflow-y: auto; margin-bottom: 20px;">
                        ${this.renderCart()}
                    </div>
                    <div style="border-top: 1px solid var(--glass-border); padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Subtotal:</span>
                            <span id="pos-subtotal">${Utils.formatCurrency(this.calculateSubtotal())}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Tax (18%):</span>
                            <span id="pos-tax">${Utils.formatCurrency(this.calculateTax())}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 1.2rem; font-weight: 700;">
                            <span>Total:</span>
                            <span id="pos-total">${Utils.formatCurrency(this.calculateTotal())}</span>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label>Customer:</label>
                            <select id="pos-customer" class="form-select" style="width: 100%; padding: 12px; font-size: 1rem;">
                                <option value="">Walk-in Customer</option>
                                ${this.renderCustomerOptions()}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label>Payment Method:</label>
                            <select id="pos-payment-method" class="form-select" style="width: 100%; padding: 12px; font-size: 1rem;">
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="card">Card</option>
                                <option value="credit">Credit</option>
                            </select>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <button class="btn btn-secondary" onclick="POS.clearCart()">Clear</button>
                            <button class="btn btn-primary" onclick="POS.completeSale()">Complete Sale</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderProducts() {
        const business = Storage.getCurrentBusiness();
        const products = Storage.getProducts(business.id);
        
        if (products.length === 0) {
            return '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">No products available. Add products first.</p>';
        }
        
        return products.map(product => `
            <div class="product-card glass-card hover-lift" style="cursor: pointer; padding: 15px;" onclick="POS.addToCart('${product.id}')">
                <div style="font-weight: 600; margin-bottom: 5px;">${product.name}</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 10px;">${product.category || 'Uncategorized'}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700;">${Utils.formatCurrency(product.price)}</span>
                    <span style="font-size: 0.9rem; color: var(--text-secondary);">Stock: ${product.stock || 0}</span>
                </div>
            </div>
        `).join('');
    },
    
    renderCustomerOptions() {
        const business = Storage.getCurrentBusiness();
        const customers = Storage.getCustomers(business.id);
        return customers.map(customer => `
            <option value="${customer.id}">${customer.name} (${customer.phone || 'No phone'})</option>
        `).join('');
    },
    
    renderCart() {
        if (this.cart.length === 0) {
            return '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Cart is empty</p>';
        }
        
        return `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${this.cart.map((item, index) => `
                    <div class="glass-card" style="padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: 600;">${item.name}</div>
                            <button class="btn btn-danger" style="padding: 5px 10px; min-width: auto;" onclick="POS.removeFromCart(${index})">✕</button>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">
                                ${Utils.formatCurrency(item.price)} × 
                                <div style="display: inline-flex; align-items: center; gap: 5px; margin-left: 5px;">
                                    <button class="btn btn-secondary" style="padding: 2px 8px; min-width: auto;" onclick="POS.decreaseQuantity(${index})">-</button>
                                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                                    <button class="btn btn-secondary" style="padding: 2px 8px; min-width: auto;" onclick="POS.increaseQuantity(${index})">+</button>
                                </div>
                            </div>
                            <div style="font-weight: 700;">${Utils.formatCurrency(item.total)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    searchProducts(query) {
        const business = Storage.getCurrentBusiness();
        const products = Storage.getProducts(business.id);
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
        );
        
        const container = document.getElementById('pos-products-list');
        if (filtered.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">No products found</p>';
        } else {
            container.innerHTML = filtered.map(product => `
                <div class="product-card glass-card hover-lift" style="cursor: pointer; padding: 15px;" onclick="POS.addToCart('${product.id}')">
                    <div style="font-weight: 600; margin-bottom: 5px;">${product.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 10px;">${product.category || 'Uncategorized'}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700;">${Utils.formatCurrency(product.price)}</span>
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">Stock: ${product.stock || 0}</span>
                    </div>
                </div>
            `).join('');
        }
    },
    
    addToCart(productId) {
        const business = Storage.getCurrentBusiness();
        const product = Storage.getProducts(business.id).find(p => p.id === productId);
        
        if (!product) return;
        
        // Check stock
        if ((product.stock || 0) <= 0) {
            Utils.showNotification('Product out of stock', 'error');
            return;
        }
        
        // Check if already in cart
        const existing = this.cart.find(item => item.id === productId);
        
        if (existing) {
            // Check if adding would exceed stock
            if (existing.quantity >= (product.stock || 0)) {
                Utils.showNotification('Not enough stock available', 'error');
                return;
            }
            existing.quantity += 1;
            existing.total = existing.quantity * existing.price;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price || 0),
                quantity: 1,
                total: parseFloat(product.price || 0)
            });
        }
        
        this.updateCartDisplay();
    },
    
    increaseQuantity(index) {
        const item = this.cart[index];
        if (!item) return;
        
        const business = Storage.getCurrentBusiness();
        const product = Storage.getProducts(business.id).find(p => p.id === item.id);
        
        if (!product) return;
        
        // Check stock
        if (item.quantity >= (product.stock || 0)) {
            Utils.showNotification('Not enough stock available', 'error');
            return;
        }
        
        item.quantity += 1;
        item.total = item.quantity * item.price;
        
        this.updateCartDisplay();
    },
    
    decreaseQuantity(index) {
        const item = this.cart[index];
        if (!item) return;
        
        item.quantity -= 1;
        
        if (item.quantity <= 0) {
            this.removeFromCart(index);
            return;
        }
        
        item.total = item.quantity * item.price;
        this.updateCartDisplay();
    },
    
    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateCartDisplay();
    },
    
    updateCartDisplay() {
        document.getElementById('pos-cart-items').innerHTML = this.renderCart();
        document.getElementById('pos-subtotal').textContent = Utils.formatCurrency(this.calculateSubtotal());
        document.getElementById('pos-tax').textContent = Utils.formatCurrency(this.calculateTax());
        document.getElementById('pos-total').textContent = Utils.formatCurrency(this.calculateTotal());
    },
    
    calculateSubtotal() {
        return this.cart.reduce((sum, item) => sum + item.total, 0);
    },
    
    calculateTax() {
        const subtotal = this.calculateSubtotal();
        const taxRate = Storage.getSettings().taxRate || 18;
        return (subtotal * taxRate) / 100;
    },
    
    calculateTotal() {
        return this.calculateSubtotal() + this.calculateTax();
    },
    
    clearCart() {
        this.cart = [];
        this.updateCartDisplay();
    },
    
    completeSale() {
        if (this.cart.length === 0) {
            Utils.showNotification('Cart is empty', 'error');
            return;
        }
        
        const business = Storage.getCurrentBusiness();
        const customerId = document.getElementById('pos-customer').value;
        const paymentMethod = document.getElementById('pos-payment-method').value;
        const total = this.calculateTotal();
        
        // Get customer name if selected
        let customerName = 'Walk-in Customer';
        if (customerId) {
            const customers = Storage.getCustomers(business.id);
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
                customerName = customer.name;
            }
        }
        
        // Create sale record
        const sale = {
            id: Utils.generateId(),
            businessId: business.id,
            date: new Date().toISOString().split('T')[0],
            items: [...this.cart],
            subtotal: this.calculateSubtotal(),
            tax: this.calculateTax(),
            total: total,
            customerName: customerName,
            customerId: customerId || undefined,
            paymentMethod: paymentMethod,
            status: 'paid'
        };
        
        // Save sale
        Storage.saveSale(sale);
        
        // Update product stock
        this.cart.forEach(item => {
            const product = Storage.getProducts(business.id).find(p => p.id === item.id);
            if (product) {
                product.stock = (product.stock || 0) - item.quantity;
                Storage.saveProduct(product);
            }
        });
        
        // Generate invoice
        this.generateInvoice(sale);
        
        // Clear cart
        this.clearCart();
        
        Utils.showNotification('Sale completed successfully!', 'success');
        
        // Refresh dashboard
        if (window.Dashboard) Dashboard.render();
    },
    
    generateInvoice(sale) {
        // Create invoice content
        const invoiceContent = `
            <div id="invoice-modal" class="modal" style="display: flex;">
                <div class="modal-content glass-card" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>Invoice Receipt</h3>
                        <button class="close-btn" onclick="document.getElementById('invoice-modal').remove()">&times;</button>
                    </div>
                    <div style="padding: 20px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="margin: 0 0 10px 0;">SARAL BUSINESS</h2>
                            <p style="margin: 0; color: var(--text-secondary);">Invoice Receipt</p>
                            <p style="margin: 5px 0 0 0; color: var(--text-secondary);">Date: ${Utils.formatDate(sale.date)}</p>
                            <p style="margin: 5px 0 0 0; color: var(--text-secondary);">Invoice #: ${sale.id.substring(0, 8).toUpperCase()}</p>
                        </div>
                        
                        <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                            <p style="margin: 0 0 5px 0;"><strong>Customer:</strong> ${sale.customerName}</p>
                            <p style="margin: 0;"><strong>Payment Method:</strong> ${sale.paymentMethod.toUpperCase()}</p>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--glass-border);">
                                    <th style="padding: 10px; text-align: left;">Item</th>
                                    <th style="padding: 10px; text-align: right;">Qty</th>
                                    <th style="padding: 10px; text-align: right;">Price</th>
                                    <th style="padding: 10px; text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sale.items.map(item => `
                                    <tr style="border-bottom: 1px solid var(--glass-border);">
                                        <td style="padding: 10px;">${item.name}</td>
                                        <td style="padding: 10px; text-align: right;">${item.quantity}</td>
                                        <td style="padding: 10px; text-align: right;">${Utils.formatCurrency(item.price)}</td>
                                        <td style="padding: 10px; text-align: right;">${Utils.formatCurrency(item.total)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div style="margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Subtotal:</span>
                                <span>${Utils.formatCurrency(sale.subtotal)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Tax (18%):</span>
                                <span>${Utils.formatCurrency(sale.tax)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--glass-border);">
                                <span>Total:</span>
                                <span>${Utils.formatCurrency(sale.total)}</span>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--glass-border); color: var(--text-secondary);">
                            <p style="margin: 0;">Thank you for your business!</p>
                            <p style="margin: 5px 0 0 0;">Powered by SARAL Business Management</p>
                        </div>
                        
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button class="btn btn-primary" onclick="window.print()" style="flex: 1;">Print Invoice</button>
                            <button class="btn btn-secondary" onclick="document.getElementById('invoice-modal').remove()" style="flex: 1;">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to modal container
        document.getElementById('modal-container').innerHTML = invoiceContent;
    }
};

// Make globally available
window.POS = POS;