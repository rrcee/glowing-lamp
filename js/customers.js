// ============================================
// SARAL - Customers Management
// ============================================

const Customers = {
    init() {
        // Customers doesn't need initialization on app start
    },
    
    render() {
        const container = document.getElementById('screen-customers');
        const business = Storage.getCurrentBusiness();
        
        if (!business) {
            container.innerHTML = '<p>No business selected</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="customers-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Customer Management</h3>
                    <button class="btn btn-primary" onclick="Customers.showAddModal()">
                        + Add Customer
                    </button>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px; max-width: 400px;">
                    <input type="text" id="customers-search" class="form-input" placeholder="Search customers..." oninput="Customers.searchCustomers(this.value)">
                </div>
                
                <div id="customers-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${this.renderCustomers()}
                </div>
            </div>
        `;
    },
    
    renderCustomers() {
        const business = Storage.getCurrentBusiness();
        const customers = Storage.getCustomers(business.id);
        
        if (customers.length === 0) {
            return `
                <div class="glass-card" style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">No customers added yet</p>
                    <button class="btn btn-primary" onclick="Customers.showAddModal()">Add Your First Customer</button>
                </div>
            `;
        }
        
        return customers.map(customer => `
            <div class="customer-card glass-card hover-lift" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <h4 style="margin: 0;">${customer.name}</h4>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary" style="padding: 6px 10px;" onclick="Customers.showEditModal('${customer.id}')">✏️</button>
                        <button class="btn btn-danger" style="padding: 6px 10px;" onclick="Customers.deleteCustomer('${customer.id}')">🗑️</button>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px;">
                        ${customer.email ? `📧 ${customer.email}` : ''}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px;">
                        ${customer.phone ? `📞 ${customer.phone}` : ''}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">
                        ${customer.address ? `📍 ${customer.address}` : ''}
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid var(--glass-border);">
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">Added: ${Utils.formatDate(customer.createdAt)}</span>
                </div>
            </div>
        `).join('');
    },
    
    searchCustomers(query) {
        const business = Storage.getCurrentBusiness();
        const customers = Storage.getCustomers(business.id);
        const filtered = customers.filter(c => 
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(query.toLowerCase())) ||
            (c.phone && c.phone.includes(query))
        );
        
        const container = document.getElementById('customers-list');
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <p style="color: var(--text-secondary);">No customers found</p>
                </div>
            `;
        } else {
            container.innerHTML = filtered.map(customer => `
                <div class="customer-card glass-card hover-lift" style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <h4 style="margin: 0;">${customer.name}</h4>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary" style="padding: 6px 10px;" onclick="Customers.showEditModal('${customer.id}')">✏️</button>
                            <button class="btn btn-danger" style="padding: 6px 10px;" onclick="Customers.deleteCustomer('${customer.id}')">🗑️</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px;">
                            ${customer.email ? `📧 ${customer.email}` : ''}
                        </div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px;">
                            ${customer.phone ? `📞 ${customer.phone}` : ''}
                        </div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">
                            ${customer.address ? `📍 ${customer.address}` : ''}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid var(--glass-border);">
                        <span style="color: var(--text-secondary); font-size: 0.9rem;">Added: ${Utils.formatDate(customer.createdAt)}</span>
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
                        <h3>Add New Customer</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <form id="customer-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="form-group">
                            <label>Customer Name *</label>
                            <input type="text" id="customer-name" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="customer-email" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" id="customer-phone" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label>Address</label>
                            <textarea id="customer-address" class="form-textarea" rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Customer</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('customer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomer();
        });
    },
    
    showEditModal(customerId) {
        const business = Storage.getCurrentBusiness();
        const customer = Storage.getCustomers(business.id).find(c => c.id === customerId);
        
        if (!customer) return;
        
        const modal = document.getElementById('modal-container');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-content glass-card" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Edit Customer</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <form id="customer-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <input type="hidden" id="customer-id" value="${customer.id}">
                        
                        <div class="form-group">
                            <label>Customer Name *</label>
                            <input type="text" id="customer-name" class="form-input" value="${customer.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="customer-email" class="form-input" value="${customer.email || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" id="customer-phone" class="form-input" value="${customer.phone || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label>Address</label>
                            <textarea id="customer-address" class="form-textarea" rows="3">${customer.address || ''}</textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Customer</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('customer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomer();
        });
    },
    
    saveCustomer() {
        const business = Storage.getCurrentBusiness();
        const id = document.getElementById('customer-id')?.value;
        const name = document.getElementById('customer-name').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const address = document.getElementById('customer-address').value.trim();
        
        // Validate
        if (!name) {
            Utils.showNotification('Customer name is required', 'error');
            return;
        }
        
        // Create customer object
        const customer = {
            id: id || Utils.generateId(),
            businessId: business.id,
            name,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            createdAt: id ? undefined : new Date().toISOString()
        };
        
        // Save customer
        Storage.saveCustomer(customer);
        
        // Close modal
        document.querySelector('.modal')?.remove();
        
        // Refresh customers list
        this.render();
        
        // Refresh POS customer dropdown if on POS screen
        if (Navigation.getCurrentScreen() === 'pos') {
            const customerSelect = document.getElementById('pos-customer');
            if (customerSelect) {
                customerSelect.innerHTML = `
                    <option value="">Walk-in Customer</option>
                    ${this.renderCustomerOptions()}
                `;
            }
        }
        
        Utils.showNotification(id ? 'Customer updated successfully!' : 'Customer added successfully!', 'success');
    },
    
    renderCustomerOptions() {
        const business = Storage.getCurrentBusiness();
        const customers = Storage.getCustomers(business.id);
        return customers.map(customer => `
            <option value="${customer.id}">${customer.name} (${customer.phone || 'No phone'})</option>
        `).join('');
    },
    
    async deleteCustomer(customerId) {
        const confirmed = await Utils.confirm('Are you sure you want to delete this customer?');
        
        if (confirmed) {
            Storage.deleteCustomer(customerId);
            this.render();
            Utils.showNotification('Customer deleted successfully', 'success');
        }
    }
};

// Make globally available
window.Customers = Customers;