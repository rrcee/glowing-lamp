// ============================================
// SARAL - Dashboard
// ============================================

const Dashboard = {
    init() {
        this.render();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Refresh dashboard when needed
        setTimeout(() => {
            const refreshBtn = document.getElementById('refresh-dashboard');
            if (refreshBtn) {
                // Remove existing event listeners to prevent duplicates
                const newRefreshBtn = refreshBtn.cloneNode(true);
                refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);
                
                newRefreshBtn.addEventListener('click', () => {
                    this.render();
                    Utils.showNotification('Dashboard refreshed', 'success');
                });
            }
        }, 100);
    },
    
    render() {
        const container = document.getElementById('screen-dashboard');
        if (!container) {
            console.error('Dashboard container not found');
            return;
        }
        
        try {
            const business = Storage.getCurrentBusiness();
            
            if (!business) {
                container.innerHTML = '<p>No business selected</p>';
                return;
            }
            
            // Get data for all businesses for consolidated view
            const user = Auth.getCurrentUser();
            const allBusinesses = Storage.getAllBusinesses(user.id);
            const allProducts = [];
            const allCustomers = [];
            const allSales = [];
            const allLosses = [];
            
            allBusinesses.forEach(biz => {
                allProducts.push(...Storage.getProducts(biz.id));
                allCustomers.push(...Storage.getCustomers(biz.id));
                allSales.push(...Storage.getSales(biz.id));
                allLosses.push(...Storage.getLosses(biz.id));
            });
            
            // Get data for current business
            const products = Storage.getProducts(business.id);
            const customers = Storage.getCustomers(business.id);
            const sales = Storage.getSales(business.id);
            const losses = Storage.getLosses(business.id);
            
            // Calculate metrics
            const metrics = this.calculateMetrics(products, customers, sales, losses);
            const allMetrics = this.calculateAllBusinessesMetrics(allProducts, allCustomers, allSales, allLosses);
            
            // Render dashboard
            container.innerHTML = `
                <div class="dashboard-container">
                    <!-- Action Bar -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2>Business Dashboard</h2>
                        <div style="display: flex; gap: 10px;">
                            <button id="refresh-dashboard" class="btn btn-secondary" style="display: flex; align-items: center; gap: 5px;">
                                🔄 Refresh
                            </button>
                        </div>
                    </div>
                    
                    <!-- Business Overview -->
                    <div class="glass-card" style="margin-bottom: 30px; padding: 20px;">
                        <h3 style="margin-top: 0;">Business Performance Overview</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                            <!-- Profit/Loss Distribution for Current Business -->
                            <div>
                                <h4>${business.name} Profit/Loss</h4>
                                <div id="business-profit-loss-chart" style="height: 200px; position: relative;">
                                    ${this.renderProfitLossChart(metrics.profit, metrics.loss, 'Current Business')}
                                </div>
                            </div>
                            
                            <!-- Consolidated Profit/Loss Across All Businesses -->
                            <div>
                                <h4>Consolidated Profit/Loss</h4>
                                <div id="consolidated-profit-loss-chart" style="height: 200px; position: relative;">
                                    ${this.renderProfitLossChart(allMetrics.profit, allMetrics.loss, 'All Businesses')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Stats Cards -->
                    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        ${this.renderStatCard('💰', 'Today\'s Sales', Utils.formatCurrency(metrics.todaySales), metrics.salesChange)}
                        ${this.renderStatCard('📦', 'Total Products', metrics.totalProducts, null)}
                        ${this.renderStatCard('⚠️', 'Low Stock Items', metrics.lowStock, null, 'warning')}
                        ${this.renderStatCard('👥', 'Total Customers', metrics.totalCustomers, null)}
                        ${this.renderStatCard('💳', 'Total Revenue', Utils.formatCurrency(metrics.totalRevenue), metrics.revenueChange)}
                        ${this.renderStatCard('📊', 'Total Transactions', metrics.totalTransactions, null)}
                        ${this.renderStatCard('📈', 'Profit', Utils.formatCurrency(metrics.profit), null, 'success')}
                        ${this.renderStatCard('📉', 'Loss', Utils.formatCurrency(metrics.totalLoss), null, 'danger')}
                    </div>
                    
                    <!-- Charts and Analytics -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        <div class="glass-card">
                            <h3 style="margin-bottom: 20px;">Sales Trend (Last 7 Days)</h3>
                            <div id="sales-chart" style="height: 300px; position: relative;">
                                ${this.renderSalesChart(metrics.salesTrend)}
                            </div>
                        </div>
                        
                        <div class="glass-card">
                            <h3 style="margin-bottom: 20px;">Top Selling Products</h3>
                            <div id="products-chart" style="height: 300px; position: relative;">
                                ${this.renderProductsChart(metrics.topProducts)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Financial Metrics -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        <div class="glass-card">
                            <h3 style="margin-bottom: 20px;">Financial Performance</h3>
                            <div style="display: flex; flex-direction: column; gap: 20px;">
                                ${this.renderFinancialMetric('Revenue Growth', metrics.revenueGrowth, 'positive')}
                                ${this.renderFinancialMetric('Customer Retention', metrics.customerRetention, 'positive')}
                                ${this.renderFinancialMetric('Inventory Turnover', metrics.inventoryTurnover, 'positive')}
                            </div>
                        </div>
                        
                        <div class="glass-card">
                            <h3 style="margin-bottom: 20px;">Expense Tracking</h3>
                            <div style="display: flex; flex-direction: column; gap: 20px;">
                                ${this.renderFinancialMetric('Cost of Goods', metrics.cogsPercentage, 'negative')}
                                ${this.renderFinancialMetric('Operating Expenses', metrics.operatingExpenses, 'negative')}
                                ${this.renderFinancialMetric('Net Profit Margin', metrics.profitMargin, 'positive')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Loss Categories -->
                    <div class="glass-card" style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3>Loss Analysis</h3>
                            <button class="btn btn-secondary" onclick="Navigation.showScreen('loss-tracking')">View All Losses</button>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            ${this.renderLossCategories(losses)}
                        </div>
                    </div>
                    
                    <!-- Low Stock Alerts -->
                    <div class="glass-card" style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3>Low Stock Alerts</h3>
                            <button class="btn btn-secondary" onclick="Navigation.showScreen('inventory')">View All Inventory</button>
                        </div>
                        <div id="low-stock-alerts">
                            ${this.renderLowStockAlerts(products)}
                        </div>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="dashboard-section glass-card">
                        <h3 style="margin-bottom: 20px;">Recent Sales</h3>
                        <div class="recent-sales">
                            ${this.renderRecentSales(sales.slice(-5).reverse())}
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="dashboard-section glass-card" style="margin-top: 20px;">
                        <h3 style="margin-bottom: 20px;">Quick Actions</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            <button class="btn btn-primary" onclick="Navigation.showScreen('pos')">
                                💰 New Sale
                            </button>
                            <button class="btn btn-secondary" onclick="Navigation.showScreen('products')">
                                📦 Add Product
                            </button>
                            <button class="btn btn-secondary" onclick="Navigation.showScreen('customers')">
                                👥 Add Customer
                            </button>
                            <button class="btn btn-secondary" onclick="Navigation.showScreen('loss-tracking')">
                                📉 Record Loss
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Re-setup event listeners after rendering
            this.setupEventListeners();
        } catch (error) {
            console.error('Dashboard render error:', error);
            container.innerHTML = '<p>Error loading dashboard. Please try refreshing the page.</p>';
        }
    },
    
    renderProfitLossChart(profit, loss, title) {
        try {
            const total = profit + loss;
            if (total === 0) {
                return `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">No financial data available</div>`;
            }
            
            const profitPercentage = (profit / total) * 100;
            const lossPercentage = (loss / total) * 100;
            
            return `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <div style="position: relative; width: 150px; height: 150px; margin-bottom: 20px;">
                        <canvas id="profit-loss-chart-canvas-${title.replace(/\s+/g, '-')}" width="150" height="150"></canvas>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                            <div style="font-size: 1.1rem; font-weight: bold;">${Utils.formatCurrency(profit - loss)}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Net Result</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 20px; text-align: center;">
                        <div>
                            <div style="font-weight: bold; color: var(--success); font-size: 1rem;">${Utils.formatCurrency(profit)}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${Math.round(profitPercentage)}% Profit</div>
                        </div>
                        <div>
                            <div style="font-weight: bold; color: var(--danger); font-size: 1rem;">${Utils.formatCurrency(loss)}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${Math.round(lossPercentage)}% Loss</div>
                        </div>
                    </div>
                </div>
                <script>
                    // Simple pie chart rendering for profit/loss
                    const canvas = document.getElementById('profit-loss-chart-canvas-${title.replace(/\s+/g, '-')}');
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        const profitValue = ${profit};
                        const lossValue = ${loss};
                        const total = profitValue + lossValue;
                        
                        if (total > 0) {
                            const profitAngle = (profitValue / total) * 2 * Math.PI;
                            
                            // Draw loss (red)
                            ctx.beginPath();
                            ctx.moveTo(75, 75);
                            ctx.arc(75, 75, 70, 0, 2 * Math.PI);
                            ctx.closePath();
                            ctx.fillStyle = 'var(--danger)';
                            ctx.fill();
                            
                            // Draw profit (green)
                            if (profitValue > 0) {
                                ctx.beginPath();
                                ctx.moveTo(75, 75);
                                ctx.arc(75, 75, 70, -Math.PI/2, profitAngle - Math.PI/2);
                                ctx.closePath();
                                ctx.fillStyle = 'var(--success)';
                                ctx.fill();
                            }
                        }
                    }
                </script>
            `;
        } catch (error) {
            console.error('Profit/Loss chart render error:', error);
            return `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">Error loading chart</div>`;
        }
    },
    
    getRandomColor() {
        const colors = [
            '#7886C7', '#A9B5DF', '#2D336B', '#4ade80', '#fbbf24', 
            '#f87171', '#38bdf8', '#c084fc', '#fb7185', '#60a5fa'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    renderStatCard(icon, title, value, change = null, variant = 'default') {
        const borderColor = variant === 'warning' ? 'var(--warning)' : 
                          variant === 'success' ? 'var(--success)' : 
                          variant === 'danger' ? 'var(--danger)' : 'var(--primary)';
        
        return `
            <div class="stat-card glass-card hover-lift" style="border-left: 4px solid ${borderColor};">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <span style="font-size: 2.5rem;">${icon}</span>
                    <div style="flex: 1;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px;">${title}</div>
                        <div style="font-size: 1.75rem; font-weight: 700;">${value}</div>
                    </div>
                </div>
                ${change !== null ? `
                <div style="font-size: 0.9rem; color: ${change >= 0 ? 'var(--success)' : 'var(--danger)'};">
                    ${change >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(change))}% from yesterday
                </div>
                ` : ''}
            </div>
        `;
    },
    
    renderSalesChart(data) {
        if (!data || data.length === 0) {
            return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">No sales data available</div>';
        }
        
        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.total), 1);
        
        return `
            <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 100%; padding: 20px 10px;">
                ${data.map((point, index) => {
                    const height = (point.total / maxValue) * 80;
                    const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'var(--info)'];
                    const color = colors[index % colors.length];
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                            <div style="width: 40px; background: ${color}; height: ${height}%; border-radius: 6px 6px 0 0; margin-bottom: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: all 0.3s ease;"></div>
                            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-bottom: 5px;">${Utils.formatCurrency(point.total)}</div>
                            <div style="font-size: 0.7rem; color: var(--text-secondary);">${point.label}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    renderProductsChart(productsData) {
        if (!productsData || productsData.length === 0) {
            return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">No product data available</div>';
        }
        
        // Find max value for scaling
        const maxValue = Math.max(...productsData.map(p => p.quantity), 1);
        
        return `
            <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 100%; padding: 20px 10px;">
                ${productsData.map((product, index) => {
                    const height = (product.quantity / maxValue) * 80;
                    const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'var(--info)'];
                    const color = colors[index % colors.length];
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                            <div style="width: 50px; background: ${color}; height: ${height}%; border-radius: 6px 6px 0 0; margin-bottom: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: all 0.3s ease;"></div>
                            <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); text-align: center; max-width: 80px; overflow: hidden; text-overflow: ellipsis;">${Utils.truncate(product.name, 10)}</div>
                            <div style="font-size: 0.7rem; color: var(--text-secondary);">${product.quantity} sold</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    renderFinancialMetric(label, value, type) {
        const isPositive = type === 'positive';
        const isNegative = type === 'negative';
        const color = isPositive ? 'var(--success)' : isNegative ? 'var(--danger)' : 'var(--primary)';
        const icon = isPositive ? '↑' : isNegative ? '↓' : '';
        
        return `
            <div style="display: flex; justify-content: space-between; padding: 12px; border-radius: var(--radius-sm); background: rgba(255, 255, 255, 0.03);">
                <span>${label}</span>
                <span style="font-weight: 600; color: ${color};">
                    ${icon} ${typeof value === 'number' ? Math.round(value) : value}${isPositive || isNegative ? '%' : ''}
                </span>
            </div>
        `;
    },
    
    renderLossCategories(losses) {
        if (!losses || losses.length === 0) {
            return '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No losses recorded</div>';
        }
        
        // Group losses by category
        const lossByCategory = {};
        losses.forEach(loss => {
            if (!lossByCategory[loss.category]) {
                lossByCategory[loss.category] = 0;
            }
            lossByCategory[loss.category] += loss.amount;
        });
        
        const categories = Object.entries(lossByCategory);
        
        if (categories.length === 0) {
            return '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No losses recorded</div>';
        }
        
        return categories.map(([category, amount]) => `
            <div class="glass-card" style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>${category}</strong>
                    <span style="color: var(--danger); font-weight: 600;">${Utils.formatCurrency(amount)}</span>
                </div>
                <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min(100, (amount / 10000) * 100)}%; background: var(--danger);"></div>
                </div>
            </div>
        `).join('');
    },
    
    renderLowStockAlerts(products) {
        const lowStockThreshold = Storage.getSettings().lowStockThreshold || 10;
        const lowStockItems = products.filter(p => (p.stock || 0) <= lowStockThreshold);
        
        if (lowStockItems.length === 0) {
            return '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No low stock alerts</div>';
        }
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                ${lowStockItems.slice(0, 4).map(product => `
                    <div class="glass-card" style="padding: 15px; border-left: 4px solid var(--warning);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong>${Utils.truncate(product.name, 20)}</strong>
                            <span style="color: var(--warning); font-weight: 600;">${product.stock || 0}</span>
                        </div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">Low stock alert</div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderRecentSales(sales) {
        if (!sales || sales.length === 0) {
            return '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No recent sales</div>';
        }
        
        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${sales.map(sale => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: var(--radius-sm); background: rgba(255, 255, 255, 0.03);">
                        <div>
                            <div style="font-weight: 600;">${sale.customerName || 'Anonymous'}</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">${new Date(sale.date).toLocaleDateString()}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600;">${Utils.formatCurrency(sale.total)}</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">${sale.items.length} items</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    calculateMetrics(products, customers, sales, losses) {
        // Today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Today's sales
        const todaySales = sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                saleDate.setHours(0, 0, 0, 0);
                return saleDate.getTime() === today.getTime();
            })
            .reduce((total, sale) => total + sale.total, 0);
        
        // Yesterday's sales for comparison
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const yesterdaySales = sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                saleDate.setHours(0, 0, 0, 0);
                return saleDate.getTime() === yesterday.getTime();
            })
            .reduce((total, sale) => total + sale.total, 0);
        
        const salesChange = yesterdaySales > 0 ? 
            ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;
        
        // Low stock calculation
        const lowStockThreshold = Storage.getSettings().lowStockThreshold || 10;
        const lowStock = products.filter(p => (p.stock || 0) <= lowStockThreshold).length;
        
        // Revenue change
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentSales = sales.filter(sale => new Date(sale.date) >= sevenDaysAgo);
        const recentRevenue = Utils.sum(recentSales, 'total');
        
        const olderSales = sales.filter(sale => 
            new Date(sale.date) >= new Date(sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)) && 
            new Date(sale.date) < sevenDaysAgo
        );
        const olderRevenue = Utils.sum(olderSales, 'total');
        
        const revenueChange = olderRevenue > 0 ? 
            ((recentRevenue - olderRevenue) / olderRevenue) * 100 : 0;
        
        // Sales trend (last 7 days)
        const salesTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const daySales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                saleDate.setHours(0, 0, 0, 0);
                return saleDate.getTime() === date.getTime();
            });
            
            const total = Utils.sum(daySales, 'total');
            
            salesTrend.push({
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                total: total
            });
        }
        
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
        
        // Financial metrics
        const totalRevenue = Utils.sum(sales, 'total');
        const totalLoss = Utils.sum(losses, 'amount');
        
        // Simplified profit/loss calculation
        const costOfGoods = products.reduce((total, product) => {
            return total + ((product.stock || 0) * (product.price || 0) * 0.6); // Assume 60% cost
        }, 0);
        
        const profit = totalRevenue - costOfGoods - totalLoss;
        
        // Customer retention (simplified)
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
        const customerRetention = customers.length > 0 ? (returningCustomers / customers.length) * 100 : 0;
        
        // Inventory turnover (simplified)
        const totalInventoryValue = products.reduce((total, product) => {
            return total + ((product.stock || 0) * (product.price || 0));
        }, 0);
        
        const inventoryTurnover = totalInventoryValue > 0 ? (totalRevenue / totalInventoryValue) * 100 : 0;
        
        // Profit margin
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
        
        return {
            totalProducts: products.length,
            lowStock,
            totalCustomers: customers.length,
            totalTransactions: sales.length,
            totalRevenue,
            todaySales,
            salesChange,
            revenueChange,
            salesTrend,
            topProducts,
            profit,
            totalLoss,
            customerRetention,
            inventoryTurnover,
            profitMargin,
            cogsPercentage: 60, // Simplified
            operatingExpenses: 20 // Simplified
        };
    },
    
    calculateAllBusinessesMetrics(products, customers, sales, losses) {
        // Calculate consolidated metrics for all businesses
        const totalRevenue = Utils.sum(sales, 'total');
        const totalLoss = Utils.sum(losses, 'amount');
        
        // Simplified profit/loss calculation
        const costOfGoods = products.reduce((total, product) => {
            return total + ((product.stock || 0) * (product.price || 0) * 0.6); // Assume 60% cost
        }, 0);
        
        const profit = totalRevenue - costOfGoods - totalLoss;
        
        return {
            totalRevenue,
            totalProducts: products.length,
            totalCustomers: customers.length,
            totalTransactions: sales.length,
            profit,
            loss: totalLoss
        };
    }
};

// Make globally available
window.Dashboard = Dashboard;