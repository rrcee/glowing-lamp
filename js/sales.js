// ============================================
// SARAL - Sales History
// ============================================

const Sales = {
    init() {
        // Sales doesn't need initialization on app start
    },
    
    render() {
        const container = document.getElementById('screen-sales');
        const business = Storage.getCurrentBusiness();
        
        if (!business) {
            container.innerHTML = '<p>No business selected</p>';
            return;
        }
        
        const sales = Storage.getSales(business.id);
        
        container.innerHTML = `
            <div class="sales-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Sales History</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="Sales.exportSales()">Export</button>
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px; max-width: 400px;">
                    <input type="text" id="sales-search" class="form-input" placeholder="Search sales..." oninput="Sales.searchSales(this.value)">
                </div>
                
                <div id="sales-list">
                    ${this.renderSales(sales)}
                </div>
            </div>
        `;
    },
    
    renderSales(sales) {
        if (sales.length === 0) {
            return `
                <div class="glass-card" style="text-align: center; padding: 40px;">
                    <p style="color: var(--text-secondary);">No sales recorded yet</p>
                </div>
            `;
        }
        
        // Sort by date (newest first)
        const sortedSales = [...sales].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        return `
            <div class="glass-card" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Date</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Customer</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-secondary);">Items</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-secondary);">Subtotal</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-secondary);">Tax</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-secondary);">Total</th>
                            <th style="padding: 12px; text-align: center; color: var(--text-secondary);">Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedSales.map(sale => `
                            <tr style="border-bottom: 1px solid var(--glass-border);">
                                <td style="padding: 12px;">${Utils.formatDate(sale.date)}</td>
                                <td style="padding: 12px;">${sale.customerName || 'Walk-in'}</td>
                                <td style="padding: 12px;">
                                    ${sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                                </td>
                                <td style="padding: 12px; text-align: right;">${Utils.formatCurrency(sale.subtotal)}</td>
                                <td style="padding: 12px; text-align: right;">${Utils.formatCurrency(sale.tax)}</td>
                                <td style="padding: 12px; text-align: right; font-weight: 600;">${Utils.formatCurrency(sale.total)}</td>
                                <td style="padding: 12px; text-align: center;">
                                    <span style="padding: 4px 12px; border-radius: 12px; background: var(--success); color: white; font-size: 0.85rem;">
                                        ${sale.paymentMethod?.toUpperCase() || 'CASH'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                <div class="glass-card" style="padding: 20px; max-width: 300px;">
                    <h4 style="margin-bottom: 15px;">Sales Summary</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Total Sales:</span>
                        <span>${Utils.formatCurrency(Utils.sum(sortedSales, 'total'))}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Total Transactions:</span>
                        <span>${sortedSales.length}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Average Sale:</span>
                        <span>${Utils.formatCurrency(Utils.average(sortedSales, 'total'))}</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    searchSales(query) {
        const business = Storage.getCurrentBusiness();
        const sales = Storage.getSales(business.id);
        const filtered = sales.filter(sale => 
            (sale.customerName && sale.customerName.toLowerCase().includes(query.toLowerCase())) ||
            sale.items.some(item => item.name.toLowerCase().includes(query.toLowerCase())) ||
            sale.date.includes(query)
        );
        
        document.getElementById('sales-list').innerHTML = this.renderSales(filtered);
    },
    
    exportSales() {
        const business = Storage.getCurrentBusiness();
        const sales = Storage.getSales(business.id);
        
        if (sales.length === 0) {
            Utils.showNotification('No sales to export', 'error');
            return;
        }
        
        // Prepare data for export
        const exportData = sales.map(sale => ({
            date: sale.date,
            customer: sale.customerName,
            items: sale.items.map(item => `${item.name} (${item.quantity} x ${Utils.formatCurrency(item.price)})`).join(', '),
            subtotal: sale.subtotal,
            tax: sale.tax,
            total: sale.total,
            paymentMethod: sale.paymentMethod
        }));
        
        Utils.exportToCSV(exportData, `sales-history-${new Date().toISOString().split('T')[0]}.csv`);
        Utils.showNotification('Sales history exported successfully!', 'success');
    }
};

// Make globally available
window.Sales = Sales;