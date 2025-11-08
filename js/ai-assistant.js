// ============================================
// SARAL - AI Assistant
// ============================================

const AIAssistant = {
    isOpen: false,
    
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Close AI assistant when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('ai-assistant-modal');
            if (modal && !modal.classList.contains('hidden') && 
                !modal.contains(e.target) && 
                !e.target.closest('#ai-assistant-btn')) {
                this.close();
            }
        });
        
        // Send message on button click
        document.getElementById('send-ai-message')?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Send message on Enter key
        document.getElementById('ai-chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.quickAction(action);
            });
        });
        
        // Close button
        document.getElementById('close-ai-assistant')?.addEventListener('click', () => {
            this.close();
        });
    },
    
    open() {
        const modal = document.getElementById('ai-assistant-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.isOpen = true;
            
            // Focus input
            setTimeout(() => {
                document.getElementById('ai-chat-input')?.focus();
            }, 100);
            
            // Add welcome message if chat is empty
            const messagesContainer = document.getElementById('ai-chat-messages');
            if (messagesContainer && messagesContainer.innerHTML.trim() === '') {
                this.addMessage('Hello! I\'m your SARAL AI Assistant. How can I help you today?', 'ai');
            }
        }
    },
    
    close() {
        const modal = document.getElementById('ai-assistant-modal');
        if (modal) {
            modal.classList.add('hidden');
            this.isOpen = false;
        }
    },
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },
    
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${Utils.sanitizeHTML(text)}
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        input.value = '';
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTyping();
        
        // Simulate AI processing delay
        setTimeout(() => {
            this.hideTyping();
            this.processMessage(message);
        }, 1000);
    },
    
    showTyping() {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message ai typing';
        typingDiv.id = 'ai-typing';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    hideTyping() {
        const typingDiv = document.getElementById('ai-typing');
        if (typingDiv) {
            typingDiv.remove();
        }
    },
    
    processMessage(message) {
        // Convert to lowercase for easier matching
        const lowerMessage = message.toLowerCase();
        
        // Handle common queries
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            this.addMessage('Hello! How can I assist you with your business today?', 'ai');
        } else if (lowerMessage.includes('sales') && lowerMessage.includes('today')) {
            this.quickAction('sales-summary');
        } else if (lowerMessage.includes('stock') || lowerMessage.includes('inventory')) {
            this.quickAction('low-stock');
        } else if (lowerMessage.includes('product') || lowerMessage.includes('best')) {
            this.quickAction('best-products');
        } else if (lowerMessage.includes('help')) {
            this.addMessage('I can help you with:\n- Sales summaries\n- Inventory alerts\n- Product recommendations\n- Business insights\n\nTry asking questions like:\n- "What are today\'s sales?"\n- "Show me low stock items"\n- "Which products sell best?"', 'ai');
        } else if (lowerMessage.includes('thank')) {
            this.addMessage('You\'re welcome! Is there anything else I can help you with?', 'ai');
        } else {
            // Default response
            this.addMessage('I understand you\'re asking about: "' + message + '". I can help with sales data, inventory management, and business insights. Would you like me to show you some quick actions?', 'ai');
        }
    },
    
    quickAction(action) {
        switch (action) {
            case 'sales-summary':
                this.showSalesSummary();
                break;
            case 'low-stock':
                this.showLowStockAlerts();
                break;
            case 'best-products':
                this.showBestSellingProducts();
                break;
            default:
                this.addMessage('I can help with that! What specific information do you need?', 'ai');
        }
    },
    
    showSalesSummary() {
        const business = Storage.getCurrentBusiness();
        if (!business) {
            this.addMessage('No business selected.', 'ai');
            return;
        }
        
        const sales = Storage.getSales(business.id);
        const products = Storage.getProducts(business.id);
        const customers = Storage.getCustomers(business.id);
        
        // Calculate metrics
        const today = new Date().toISOString().split('T')[0];
        const todaySales = sales.filter(s => s.date === today);
        const todayTotal = Utils.sum(todaySales, 'total');
        
        const totalSales = Utils.sum(sales, 'total');
        const totalTransactions = sales.length;
        const avgTransaction = totalTransactions > 0 ? (totalSales / totalTransactions) : 0;
        
        const message = `
📊 <strong>Sales Summary</strong>

Today's Sales: ${Utils.formatCurrency(todayTotal)}
Total Sales: ${Utils.formatCurrency(totalSales)}
Total Transactions: ${totalTransactions}
Average Transaction: ${Utils.formatCurrency(avgTransaction)}
Total Products: ${products.length}
Total Customers: ${customers.length}
        `;
        
        this.addMessage(message, 'ai');
    },
    
    showLowStockAlerts() {
        const business = Storage.getCurrentBusiness();
        if (!business) {
            this.addMessage('No business selected.', 'ai');
            return;
        }
        
        const products = Storage.getProducts(business.id);
        const lowStockThreshold = Storage.getSettings().lowStockThreshold || 10;
        const lowStockItems = products.filter(p => (p.stock || 0) <= lowStockThreshold);
        
        if (lowStockItems.length === 0) {
            this.addMessage('✅ Great news! All your products have sufficient stock levels.', 'ai');
            return;
        }
        
        let message = `⚠️ <strong>Low Stock Alert</strong>\n\n`;
        
        if (lowStockItems.length > 5) {
            message += `You have ${lowStockItems.length} items with low stock:\n\n`;
            message += lowStockItems.slice(0, 5).map(p => 
                `- ${p.name}: ${p.stock || 0} remaining`
            ).join('\n');
            message += `\n... and ${lowStockItems.length - 5} more items.`;
        } else {
            message += `These items need restocking:\n\n`;
            message += lowStockItems.map(p => 
                `- ${p.name}: ${p.stock || 0} remaining`
            ).join('\n');
        }
        
        this.addMessage(message, 'ai');
    },
    
    showBestSellingProducts() {
        const business = Storage.getCurrentBusiness();
        if (!business) {
            this.addMessage('No business selected.', 'ai');
            return;
        }
        
        const sales = Storage.getSales(business.id);
        const products = Storage.getProducts(business.id);
        
        // Calculate product sales quantities
        const productSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = 0;
                }
                productSales[item.id] += item.quantity;
            });
        });
        
        // Convert to array and sort by quantity sold
        const sortedProducts = Object.entries(productSales)
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
        
        if (sortedProducts.length === 0) {
            this.addMessage('No sales data available yet. Make some sales to see best-selling products!', 'ai');
            return;
        }
        
        let message = `🏆 <strong>Top Selling Products</strong>\n\n`;
        message += sortedProducts.map((p, index) => 
            `${index + 1}. ${p.name}: ${p.quantity} sold`
        ).join('\n');
        
        this.addMessage(message, 'ai');
    }
};

// Make globally available
window.AIAssistant = AIAssistant;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.AIAssistant) {
        AIAssistant.init();
    }
});