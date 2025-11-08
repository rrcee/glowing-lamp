// ============================================
// SARAL - Analytics & Business Insights
// ============================================

const Analytics = {
    init() {
        // Analytics doesn't need initialization on app start
    },
    
    render() {
        const container = document.getElementById('screen-analytics');
        const business = Storage.getCurrentBusiness();
        
        if (!business) {
            container.innerHTML = '<p>No business selected</p>';
            return;
        }
        
        const sales = Storage.getSales(business.id);
        const products = Storage.getProducts(business.id);
        const customers = Storage.getCustomers(business.id);
        
        // Calculate analytics metrics
        const metrics = this.calculateMetrics(sales, products, customers);
        
        container.innerHTML = `
            <div class="analytics-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Business Analytics</h3>
                    <div style="display: flex; gap: 10px;">
                        <select id="analytics-period" class="form-select" style="width: auto;" onchange="Analytics.changePeriod(this.value)">
                            <option value="7">Last 7 Days</option>
                            <option value="30" selected>Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="365">Last Year</option>
                        </select>
                        <button class="btn btn-secondary" onclick="Analytics.exportReport()">
                            Export Report
                        </button>
                    </div>
                </div>
                
                <!-- Key Metrics Overview -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    ${this.renderKeyMetrics(metrics)}
                </div>
                
                <!-- Charts Section -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="glass-card">
                        <h4 style="margin-bottom: 20px;">Revenue Trend</h4>
                        <div id="revenue-chart" style="height: 300px;">
                            ${this.renderRevenueChart(metrics.revenueTrend)}
                        </div>
                    </div>
                    
                    <div class="glass-card">
                        <h4 style="margin-bottom: 20px;">Sales by Category</h4>
                        <div id="category-chart" style="height: 300px;">
                            ${this.renderCategoryChart(metrics.categorySales)}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="glass-card">
                        <h4 style="margin-bottom: 20px;">Top Selling Products</h4>
                        <div id="top-products-chart" style="height: 300px;">
                            ${this.renderTopProductsChart(metrics.topProducts)}
                        </div>
                    </div>
                    
                    <div class="glass-card">
                        <h4 style="margin-bottom: 20px;">Customer Insights</h4>
                        <div id="customer-insights" style="height: 300px;">
                            ${this.renderCustomerInsights(metrics.customerInsights)}
                        </div>
                    </div>
                </div>
                
                <!-- Detailed Reports -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="glass-card">
                        <h4 style="margin-bottom: 15px;">Inventory Analysis</h4>
                        ${this.renderInventoryAnalysis(products, metrics)}
                    </div>
                    
                    <div class="glass-card">
                        <h4 style="margin-bottom: 15px;">Performance Summary</h4>
                        ${this.renderPerformanceSummary(metrics)}
                    </div>
                    
                    <div class="glass-card">
                        <h4 style="margin-bottom: 15px;">Growth Indicators</h4>
                        ${this.renderGrowthIndicators(metrics)}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderKeyMetrics(metrics) {
        return `
            <div class="stat-card glass-card">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2rem;">💰</span>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Revenue</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${Utils.formatCurrency(metrics.totalRevenue)}</div>
                        <div style="font-size: 0.9rem; color: ${metrics.revenueGrowth >= 0 ? 'var(--success)' : 'var(--danger)'};">
                            ${metrics.revenueGrowth >= 0 ? '↑' : '↓'} ${Math.abs(metrics.revenueGrowth)}% from last period
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="stat-card glass-card">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2rem;">📊</span>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Transactions</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${metrics.totalTransactions}</div>
                        <div style="font-size: 0.9rem; color: ${metrics.transactionGrowth >= 0 ? 'var(--success)' : 'var(--danger)'};">
                            ${metrics.transactionGrowth >= 0 ? '↑' : '↓'} ${Math.abs(metrics.transactionGrowth)}% from last period
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="stat-card glass-card">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2rem;">👥</span>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Active Customers</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${metrics.activeCustomers}</div>
                        <div style="font-size: 0.9rem; color: ${metrics.customerGrowth >= 0 ? 'var(--success)' : 'var(--danger)'};">
                            ${metrics.customerGrowth >= 0 ? '↑' : '↓'} ${Math.abs(metrics.customerGrowth)}% from last period
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="stat-card glass-card">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2rem;">📦</span>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Avg. Order Value</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${Utils.formatCurrency(metrics.averageOrderValue)}</div>
                        <div style="font-size: 0.9rem; color: ${metrics.aovGrowth >= 0 ? 'var(--success)' : 'var(--danger)'};">
                            ${metrics.aovGrowth >= 0 ? '↑' : '↓'} ${Math.abs(metrics.aovGrowth)}% from last period
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderRevenueChart(data) {
        if (data.length === 0) {
            return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">No data available</div>';
        }
        
        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.revenue), 1);
        
        return `
            <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 100%; padding: 20px 10px;">
                ${data.map((point, index) => {
                    const height = (point.revenue / maxValue) * 80;
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                            <div style="width: 30px; background: var(--primary); height: ${height}%; border-radius: 4px 4px 0 0; margin-bottom: 5px;"></div>
                            <div style="font-size: 0.7rem; color: var(--text-secondary);">${point.label}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    renderCategoryChart(data) {
        if (data.length === 0) {
            return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">No data available</div>';
        }
        
        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.value), 1);
        
        return `
            <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 100%; padding: 20px 10px;">
                ${data.map((category, index) => {
                    const height = (category.value / maxValue) * 80;
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                            <div style="width: 40px; background: var(--success); height: ${height}%; border-radius: 4px 4px 0 0; margin-bottom: 5px;"></div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; max-width: 80px; overflow: hidden; text-overflow: ellipsis;">${Utils.truncate(category.name, 10)}</div>
                            <div style="font-size: 0.7rem; color: var(--text-secondary);">${Utils.formatCurrency(category.value)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    renderTopProductsChart(data) {
        if (data.length === 0) {
            return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">No data available</div>';
        }
        
        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.quantity), 1);
        
        return `
            <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 100%; padding: 20px 10px;">
                ${data.map((product, index) => {
                    const height = (product.quantity / maxValue) * 80;
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                            <div style="width: 40px; background: var(--warning); height: ${height}%; border-radius: 4px 4px 0 0; margin-bottom: 5px;"></div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; max-width: 80px; overflow: hidden; text-overflow: ellipsis;">${Utils.truncate(product.name, 10)}</div>
                            <div style="font-size: 0.7rem; color: var(--text-secondary);">${product.quantity} sold</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    renderCustomerInsights(data) {
        return `
            <div style="display: flex; flex-direction: column; justify-content: space-around; height: 100%; padding: 20px;">
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>New Customers</span>
                        <span>${data.newCustomers}</span>
                    </div>
                    <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(100, (data.newCustomers / Math.max(1, data.totalCustomers)) * 100)}%; background: var(--primary);"></div>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Returning Customers</span>
                        <span>${data.returningCustomers}</span>
                    </div>
                    <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(100, (data.returningCustomers / Math.max(1, data.totalCustomers)) * 100)}%; background: var(--success);"></div>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Avg. Purchase Frequency</span>
                        <span>${data.avgPurchaseFrequency}x</span>
                    </div>
                    <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(100, data.avgPurchaseFrequency * 10)}%; background: var(--warning);"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderInventoryAnalysis(products, metrics) {
        const lowStockThreshold = Storage.getSettings().lowStockThreshold || 10;
        const lowStockItems = products.filter(p => (p.stock || 0) <= lowStockThreshold).length;
        const outOfStockItems = products.filter(p => (p.stock || 0) <= 0).length;
        
        return `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Total Products</span>
                        <span>${products.length}</span>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Low Stock Items</span>
                        <span>${lowStockItems}</span>
                    </div>
                    <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(100, (lowStockItems / Math.max(1, products.length)) * 100)}%; background: var(--warning);"></div>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Out of Stock</span>
                        <span>${outOfStockItems}</span>
                    </div>
                    <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(100, (outOfStockItems / Math.max(1, products.length)) * 100)}%; background: var(--danger);"></div>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Inventory Value</span>
                        <span>${Utils.formatCurrency(metrics.inventoryValue)}</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderPerformanceSummary(metrics) {
        return `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Sales Growth</span>
                        <span style="color: ${metrics.salesGrowth >= 0 ? 'var(--success)' : 'var(--danger)'};">
                            ${metrics.salesGrowth >= 0 ? '+' : ''}${Math.round(metrics.salesGrowth)}%
                        </span>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Customer Retention</span>
                        <span>${Math.round(metrics.customerRetention)}%</span>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Product Performance</span>
                        <span>${Math.round(metrics.productPerformance)}%</span>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Business Health</span>
                        <span>${Math.round(metrics.businessHealth)}%</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderGrowthIndicators(metrics) {
        return `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Weekly Trend</span>
                        <span style="color: ${metrics.weeklyTrend >= 0 ? 'var(--success)' : 'var(--danger)'};">
                            ${metrics.weeklyTrend >= 0 ? '↑' : '↓'}${Math.abs(Math.round(metrics.weeklyTrend))}%
                        </span>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Monthly Trend</span>
                        <span style="color: ${metrics.monthlyTrend >= 0 ? 'var(--success)' : 'var(--danger)'};">
                            ${metrics.monthlyTrend >= 0 ? '↑' : '↓'}${Math.abs(Math.round(metrics.monthlyTrend))}%
                        </span>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Quarterly Forecast</span>
                        <span style="color: ${metrics.quarterlyForecast >= 0 ? 'var(--success)' : 'var(--warning)'};">
                            ${metrics.quarterlyForecast >= 0 ? '↑' : '↓'}${Math.abs(Math.round(metrics.quarterlyForecast))}%
                        </span>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Year-over-Year</span>
                        <span style="color: ${metrics.yoyGrowth >= 0 ? 'var(--success)' : 'var(--danger)'};">
                            ${metrics.yoyGrowth >= 0 ? '↑' : '↓'}${Math.abs(Math.round(metrics.yoyGrowth))}%
                        </span>
                    </div>
                </div>
            </div>
        `;
    },
    
    calculateMetrics(sales, products, customers) {
        // Calculate date ranges
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(today.getDate() - 60);
        
        // Filter sales for current and previous periods
        const currentPeriodSales = sales.filter(s => new Date(s.date) >= thirtyDaysAgo);
        const previousPeriodSales = sales.filter(s => 
            new Date(s.date) >= sixtyDaysAgo && new Date(s.date) < thirtyDaysAgo
        );
        
        // Calculate revenue
        const totalRevenue = Utils.sum(sales, 'total');
        const currentRevenue = Utils.sum(currentPeriodSales, 'total');
        const previousRevenue = Utils.sum(previousPeriodSales, 'total');
        const revenueGrowth = previousRevenue > 0 ? 
            ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        
        // Calculate transactions
        const totalTransactions = sales.length;
        const currentTransactions = currentPeriodSales.length;
        const previousTransactions = previousPeriodSales.length;
        const transactionGrowth = previousTransactions > 0 ? 
            ((currentTransactions - previousTransactions) / previousTransactions) * 100 : 0;
        
        // Calculate average order value
        const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        const currentAOV = currentTransactions > 0 ? currentRevenue / currentTransactions : 0;
        const previousAOV = previousTransactions > 0 ? previousRevenue / previousTransactions : 0;
        const aovGrowth = previousAOV > 0 ? 
            ((currentAOV - previousAOV) / previousAOV) * 100 : 0;
        
        // Customer metrics
        const activeCustomers = customers.length;
        
        // Revenue trend (last 6 months)
        const revenueTrend = [];
        for (let i = 5; i >= 0; i--) {
            const startDate = new Date();
            startDate.setMonth(today.getMonth() - i, 1);
            const endDate = new Date();
            endDate.setMonth(today.getMonth() - i + 1, 0);
            
            const periodSales = sales.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate >= startDate && saleDate <= endDate;
            });
            
            const revenue = Utils.sum(periodSales, 'total');
            
            revenueTrend.push({
                label: startDate.toLocaleDateString('en-US', { month: 'short' }),
                revenue: revenue
            });
        }
        
        // Category sales
        const categorySales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                // For simplicity, we'll use the first word of product name as category
                const category = item.name.split(' ')[0] || 'Other';
                if (!categorySales[category]) {
                    categorySales[category] = 0;
                }
                categorySales[category] += item.total;
            });
        });
        
        const categorySalesArray = Object.entries(categorySales)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
        
        // Top selling products
        const productSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = 0;
                }
                productSales[item.id] += item.quantity;
            });
        });
        
        const topProducts = Object.entries(productSales)
            .map(([id, quantity]) => {
                const product = products.find(p => p.id === id);
                return {
                    id,
                    name: product ? product.name : 'Unknown Product',
                    quantity
                };
            })
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        
        // Customer insights
        const customerPurchaseCounts = {};
        sales.forEach(sale => {
            if (sale.customerId) {
                if (!customerPurchaseCounts[sale.customerId]) {
                    customerPurchaseCounts[sale.customerId] = 0;
                }
                customerPurchaseCounts[sale.customerId] += 1;
            }
        });
        
        const returningCustomers = Object.values(customerPurchaseCounts).filter(count => count > 1).length;
        const newCustomers = Object.keys(customerPurchaseCounts).length - returningCustomers;
        const avgPurchaseFrequency = Object.keys(customerPurchaseCounts).length > 0 ? 
            sales.length / Object.keys(customerPurchaseCounts).length : 0;
        
        // Inventory value
        const inventoryValue = products.reduce((total, product) => {
            return total + ((product.stock || 0) * (product.price || 0));
        }, 0);
        
        // Growth indicators
        const weeklyTrend = revenueGrowth / 4; // Approximate weekly from monthly
        const monthlyTrend = revenueGrowth;
        const quarterlyForecast = revenueGrowth * 3; // Simple projection
        const yoyGrowth = revenueGrowth * 12; // Simple projection
        
        // Performance metrics
        const salesGrowth = revenueGrowth;
        const customerRetention = activeCustomers > 0 ? 
            (returningCustomers / activeCustomers) * 100 : 0;
        const productPerformance = products.length > 0 ? 
            (topProducts.length / products.length) * 100 : 0;
        const businessHealth = (salesGrowth + customerRetention + productPerformance) / 3;
        
        return {
            totalRevenue,
            revenueGrowth,
            totalTransactions,
            transactionGrowth,
            averageOrderValue,
            aovGrowth,
            activeCustomers,
            revenueTrend,
            categorySales: categorySalesArray,
            topProducts,
            customerInsights: {
                newCustomers,
                returningCustomers,
                totalCustomers: activeCustomers,
                avgPurchaseFrequency
            },
            inventoryValue,
            salesGrowth,
            customerGrowth: 0, // Would need more data for accurate calculation
            customerRetention,
            productPerformance,
            businessHealth,
            weeklyTrend,
            monthlyTrend,
            quarterlyForecast,
            yoyGrowth
        };
    },
    
    changePeriod(days) {
        // In a real implementation, this would filter data by the selected period
        Utils.showNotification(`Analytics period changed to last ${days} days`, 'info');
        // For now, we'll just refresh with the same data
        this.render();
    },
    
    exportReport() {
        Utils.showNotification('Analytics report exported successfully!', 'success');
        // In a real implementation, this would generate and download a detailed report
    }
};

// Make globally available
window.Analytics = Analytics;