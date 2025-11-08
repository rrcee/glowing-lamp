// ============================================
// SARAL - Loss Tracking
// ============================================

const LossTracking = {
    init() {
        // Loss tracking doesn't need initialization on app start
    },
    
    render() {
        const container = document.getElementById('screen-loss-tracking');
        const business = Storage.getCurrentBusiness();
        
        if (!business) {
            container.innerHTML = '<p>No business selected</p>';
            return;
        }
        
        const losses = Storage.getLosses(business.id);
        
        container.innerHTML = `
            <div class="loss-tracking-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Loss Tracking & Management</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="LossTracking.showAddLossModal()">
                            + Record Loss
                        </button>
                        <button class="btn btn-secondary" onclick="LossTracking.exportLosses()">
                            Export Report
                        </button>
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px; max-width: 400px;">
                    <input type="text" id="losses-search" class="form-input" placeholder="Search losses..." oninput="LossTracking.searchLosses(this.value)">
                </div>
                
                <!-- Loss Summary -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    ${this.renderLossSummary(losses)}
                </div>
                
                <!-- Loss Categories -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    ${this.renderLossCategories(losses)}
                </div>
                
                <!-- Loss Records -->
                <div class="glass-card">
                    <h4 style="margin-bottom: 20px;">Loss Records</h4>
                    <div id="losses-list">
                        ${this.renderLossesList(losses)}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderLossSummary(losses) {
        const totalLoss = Utils.sum(losses, 'amount');
        const today = new Date().toISOString().split('T')[0];
        const todayLosses = losses.filter(loss => loss.date === today);
        const todayTotal = Utils.sum(todayLosses, 'amount');
        
        return `
            <div class="stat-card glass-card" style="border-left: 4px solid var(--danger);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2rem;">📉</span>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Loss</div>
                        <div style="font-size: 1.75rem; font-weight: 700;">${Utils.formatCurrency(totalLoss)}</div>
                    </div>
                </div>
            </div>
            
            <div class="stat-card glass-card" style="border-left: 4px solid var(--warning);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2rem;">📅</span>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Today's Loss</div>
                        <div style="font-size: 1.75rem; font-weight: 700;">${Utils.formatCurrency(todayTotal)}</div>
                    </div>
                </div>
            </div>
            
            <div class="stat-card glass-card" style="border-left: 4px solid var(--primary);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2rem;">📋</span>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Records</div>
                        <div style="font-size: 1.75rem; font-weight: 700;">${losses.length}</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderLossCategories(losses) {
        const categories = {
            'damaged': { name: 'Damaged Goods', icon: '💥', color: 'var(--danger)' },
            'theft': { name: 'Theft/Loss', icon: '👮', color: 'var(--warning)' },
            'expired': { name: 'Expired Products', icon: '⏰', color: 'var(--primary)' },
            'other': { name: 'Other Losses', icon: '❓', color: 'var(--secondary)' }
        };
        
        return Object.entries(categories).map(([key, category]) => {
            const categoryLosses = losses.filter(loss => loss.category === key);
            const total = Utils.sum(categoryLosses, 'amount');
            const count = categoryLosses.length;
            
            return `
                <div class="stat-card glass-card" style="border-left: 4px solid ${category.color};">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 1.5rem;">${category.icon}</span>
                        <div style="font-weight: 600;">${category.name}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">${count} records</span>
                        <span style="font-weight: 700;">${Utils.formatCurrency(total)}</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderLossesList(losses) {
        if (losses.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>No loss records found</p>
                    <button class="btn btn-primary" onclick="LossTracking.showAddLossModal()" style="margin-top: 15px;">
                        Record Your First Loss
                    </button>
                </div>
            `;
        }
        
        // Sort by date (newest first)
        const sortedLosses = [...losses].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Date</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Category</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Product</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Reason</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-secondary);">Quantity</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-secondary);">Amount</th>
                            <th style="padding: 12px; text-align: center; color: var(--text-secondary);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedLosses.map(loss => `
                            <tr style="border-bottom: 1px solid var(--glass-border);">
                                <td style="padding: 12px;">${Utils.formatDate(loss.date)}</td>
                                <td style="padding: 12px;">
                                    <span style="padding: 4px 12px; border-radius: 12px; background: ${
                                        loss.category === 'damaged' ? 'var(--danger)' : 
                                        loss.category === 'theft' ? 'var(--warning)' : 
                                        loss.category === 'expired' ? 'var(--primary)' : 'var(--secondary)'
                                    }; color: white; font-size: 0.85rem;">
                                        ${
                                            loss.category === 'damaged' ? 'Damaged' : 
                                            loss.category === 'theft' ? 'Theft' : 
                                            loss.category === 'expired' ? 'Expired' : 'Other'
                                        }
                                    </span>
                                </td>
                                <td style="padding: 12px;">${loss.productName || 'N/A'}</td>
                                <td style="padding: 12px;">${loss.reason || 'N/A'}</td>
                                <td style="padding: 12px; text-align: right;">${loss.quantity || 'N/A'}</td>
                                <td style="padding: 12px; text-align: right; font-weight: 600; color: var(--danger);">${Utils.formatCurrency(loss.amount)}</td>
                                <td style="padding: 12px; text-align: center;">
                                    <button class="btn btn-secondary" style="padding: 6px 10px; margin-right: 5px;" onclick="LossTracking.showEditLossModal('${loss.id}')">
                                        Edit
                                    </button>
                                    <button class="btn btn-danger" style="padding: 6px 10px;" onclick="LossTracking.deleteLoss('${loss.id}')">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    showAddLossModal() {
        const business = Storage.getCurrentBusiness();
        const products = Storage.getProducts(business.id);
        
        const modal = document.getElementById('modal-container');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-content glass-card" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>Record New Loss</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <form id="loss-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="form-group">
                            <label>Date *</label>
                            <input type="date" id="loss-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Category *</label>
                            <select id="loss-category" class="form-select" required>
                                <option value="">Select Category</option>
                                <option value="damaged">Damaged Goods</option>
                                <option value="theft">Theft/Loss</option>
                                <option value="expired">Expired Products</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Product (Optional)</label>
                            <select id="loss-product" class="form-select">
                                <option value="">Select Product</option>
                                ${products.map(product => `
                                    <option value="${product.id}" data-name="${product.name}" data-price="${product.price}">
                                        ${product.name} (Stock: ${product.stock || 0})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Quantity (Optional)</label>
                            <input type="number" id="loss-quantity" class="form-input" min="1" value="1">
                        </div>
                        
                        <div class="form-group">
                            <label>Amount (₹) *</label>
                            <input type="number" id="loss-amount" class="form-input" min="0" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Reason/Notes</label>
                            <textarea id="loss-reason" class="form-textarea" rows="3" placeholder="Describe the reason for this loss..."></textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Record Loss</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Auto-calculate amount when product and quantity are selected
        const productSelect = document.getElementById('loss-product');
        const quantityInput = document.getElementById('loss-quantity');
        const amountInput = document.getElementById('loss-amount');
        
        productSelect.addEventListener('change', () => {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            if (selectedOption.value && quantityInput.value) {
                const price = parseFloat(selectedOption.dataset.price) || 0;
                const quantity = parseInt(quantityInput.value) || 0;
                amountInput.value = (price * quantity).toFixed(2);
            }
        });
        
        quantityInput.addEventListener('input', () => {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            if (selectedOption.value && quantityInput.value) {
                const price = parseFloat(selectedOption.dataset.price) || 0;
                const quantity = parseInt(quantityInput.value) || 0;
                amountInput.value = (price * quantity).toFixed(2);
            }
        });
        
        document.getElementById('loss-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLoss();
        });
    },
    
    showEditLossModal(lossId) {
        const business = Storage.getCurrentBusiness();
        const loss = Storage.getLosses(business.id).find(l => l.id === lossId);
        const products = Storage.getProducts(business.id);
        
        if (!loss) return;
        
        const modal = document.getElementById('modal-container');
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-content glass-card" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>Edit Loss Record</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <form id="loss-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <input type="hidden" id="loss-id" value="${loss.id}">
                        
                        <div class="form-group">
                            <label>Date *</label>
                            <input type="date" id="loss-date" class="form-input" value="${loss.date}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Category *</label>
                            <select id="loss-category" class="form-select" required>
                                <option value="">Select Category</option>
                                <option value="damaged" ${loss.category === 'damaged' ? 'selected' : ''}>Damaged Goods</option>
                                <option value="theft" ${loss.category === 'theft' ? 'selected' : ''}>Theft/Loss</option>
                                <option value="expired" ${loss.category === 'expired' ? 'selected' : ''}>Expired Products</option>
                                <option value="other" ${loss.category === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Product (Optional)</label>
                            <select id="loss-product" class="form-select">
                                <option value="">Select Product</option>
                                ${products.map(product => `
                                    <option value="${product.id}" data-name="${product.name}" data-price="${product.price}" ${
                                        loss.productId === product.id ? 'selected' : ''
                                    }>
                                        ${product.name} (Stock: ${product.stock || 0})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Quantity (Optional)</label>
                            <input type="number" id="loss-quantity" class="form-input" min="1" value="${loss.quantity || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label>Amount (₹) *</label>
                            <input type="number" id="loss-amount" class="form-input" min="0" step="0.01" value="${loss.amount}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Reason/Notes</label>
                            <textarea id="loss-reason" class="form-textarea" rows="3" placeholder="Describe the reason for this loss...">${loss.reason || ''}</textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Loss</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('loss-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLoss();
        });
    },
    
    saveLoss() {
        const business = Storage.getCurrentBusiness();
        const id = document.getElementById('loss-id')?.value;
        const date = document.getElementById('loss-date').value;
        const category = document.getElementById('loss-category').value;
        const productId = document.getElementById('loss-product').value;
        const quantity = document.getElementById('loss-quantity').value;
        const amount = parseFloat(document.getElementById('loss-amount').value);
        const reason = document.getElementById('loss-reason').value.trim();
        
        // Get product name if product is selected
        let productName = '';
        if (productId) {
            const productSelect = document.getElementById('loss-product');
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            productName = selectedOption.dataset.name;
        }
        
        // Validate
        if (!date || !category || isNaN(amount) || amount <= 0) {
            Utils.showNotification('Please fill all required fields with valid values', 'error');
            return;
        }
        
        // Create loss object
        const loss = {
            id: id || Utils.generateId(),
            businessId: business.id,
            date,
            category,
            productId: productId || undefined,
            productName: productName || undefined,
            quantity: quantity ? parseInt(quantity) : undefined,
            amount,
            reason: reason || undefined,
            createdAt: id ? undefined : new Date().toISOString()
        };
        
        // Save loss
        Storage.saveLoss(loss);
        
        // Close modal
        document.querySelector('.modal')?.remove();
        
        // Refresh loss tracking page
        this.render();
        
        Utils.showNotification(
            id ? 'Loss record updated successfully!' : 'Loss recorded successfully!', 
            'success'
        );
    },
    
    async deleteLoss(lossId) {
        const confirmed = await Utils.confirm('Are you sure you want to delete this loss record? This action cannot be undone.');
        
        if (confirmed) {
            Storage.deleteLoss(lossId);
            this.render();
            Utils.showNotification('Loss record deleted successfully', 'success');
        }
    },
    
    searchLosses(query) {
        const business = Storage.getCurrentBusiness();
        const losses = Storage.getLosses(business.id);
        const filtered = losses.filter(loss => 
            (loss.productName && loss.productName.toLowerCase().includes(query.toLowerCase())) ||
            (loss.reason && loss.reason.toLowerCase().includes(query.toLowerCase())) ||
            loss.date.includes(query) ||
            loss.category.includes(query)
        );
        
        document.getElementById('losses-list').innerHTML = this.renderLossesList(filtered);
    },
    
    exportLosses() {
        const business = Storage.getCurrentBusiness();
        const losses = Storage.getLosses(business.id);
        
        if (losses.length === 0) {
            Utils.showNotification('No loss records to export', 'error');
            return;
        }
        
        // Prepare data for export
        const exportData = losses.map(loss => ({
            'Date': loss.date,
            'Category': loss.category === 'damaged' ? 'Damaged Goods' : 
                       loss.category === 'theft' ? 'Theft/Loss' : 
                       loss.category === 'expired' ? 'Expired Products' : 'Other',
            'Product': loss.productName || 'N/A',
            'Quantity': loss.quantity || 'N/A',
            'Amount': loss.amount,
            'Reason': loss.reason || 'N/A'
        }));
        
        Utils.exportToCSV(exportData, `loss-records-${new Date().toISOString().split('T')[0]}.csv`);
        Utils.showNotification('Loss records exported successfully!', 'success');
    }
};

// Make globally available
window.LossTracking = LossTracking;