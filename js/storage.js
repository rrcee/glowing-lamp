// ============================================
// SARAL - Storage Manager
// ============================================

const Storage = {
    // Storage keys
    KEYS: {
        USER: 'saral_current_user',
        USERS: 'saral_users',
        BUSINESSES: 'saral_businesses',
        CURRENT_BUSINESS: 'saral_current_business',
        PRODUCTS: 'saral_products',
        INVENTORY: 'saral_inventory',
        CUSTOMERS: 'saral_customers',
        SALES: 'saral_sales',
        SETTINGS: 'saral_settings',
        LANGUAGE: 'saral_language',
        PINNED_ITEMS: 'saral_pinned_items'
    },

    // Get item from localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error for key:', key, error);
            return defaultValue;
        }
    },

    // Set item to localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error for key:', key, error);
            return false;
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error for key:', key, error);
            return false;
        }
    },

    // Clear all storage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },

    // User management
    getCurrentUser() {
        return this.get(this.KEYS.USER);
    },

    setCurrentUser(user) {
        return this.set(this.KEYS.USER, user);
    },

    removeCurrentUser() {
        return this.remove(this.KEYS.USER);
    },

    getAllUsers() {
        return this.get(this.KEYS.USERS, []);
    },

    saveUser(user) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === user.id);
        
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        
        return this.set(this.KEYS.USERS, users);
    },

    deleteUser(userId) {
        const users = this.getAllUsers().filter(u => u.id !== userId);
        return this.set(this.KEYS.USERS, users);
    },

    // Business management
    getCurrentBusiness() {
        return this.get(this.KEYS.CURRENT_BUSINESS);
    },

    setCurrentBusiness(business) {
        return this.set(this.KEYS.CURRENT_BUSINESS, business);
    },

    getAllBusinesses(userId = null) {
        const businesses = this.get(this.KEYS.BUSINESSES, []);
        if (userId) {
            return businesses.filter(b => b.userId === userId);
        }
        return businesses;
    },

    saveBusiness(business) {
        const businesses = this.getAllBusinesses();
        const index = businesses.findIndex(b => b.id === business.id);
        
        if (index >= 0) {
            businesses[index] = business;
        } else {
            businesses.push(business);
        }
        
        return this.set(this.KEYS.BUSINESSES, businesses);
    },

    deleteBusiness(businessId) {
        const businesses = this.getAllBusinesses().filter(b => b.id !== businessId);
        return this.set(this.KEYS.BUSINESSES, businesses);
    },

    // Products management
    getProducts(businessId = null) {
        const products = this.get(this.KEYS.PRODUCTS, []);
        if (businessId) {
            return products.filter(p => p.businessId === businessId);
        }
        return products;
    },

    saveProduct(product) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === product.id);
        
        if (index >= 0) {
            products[index] = { ...products[index], ...product };
        } else {
            products.push(product);
        }
        
        return this.set(this.KEYS.PRODUCTS, products);
    },

    deleteProduct(productId) {
        const products = this.getProducts().filter(p => p.id !== productId);
        return this.set(this.KEYS.PRODUCTS, products);
    },

    // Customers management
    getCustomers(businessId = null) {
        const customers = this.get(this.KEYS.CUSTOMERS, []);
        if (businessId) {
            return customers.filter(c => c.businessId === businessId);
        }
        return customers;
    },

    saveCustomer(customer) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === customer.id);
        
        if (index >= 0) {
            customers[index] = { ...customers[index], ...customer };
        } else {
            customers.push(customer);
        }
        
        return this.set(this.KEYS.CUSTOMERS, customers);
    },

    deleteCustomer(customerId) {
        const customers = this.getCustomers().filter(c => c.id !== customerId);
        return this.set(this.KEYS.CUSTOMERS, customers);
    },

    // Sales management
    getSales(businessId = null) {
        const sales = this.get(this.KEYS.SALES, []);
        if (businessId) {
            return sales.filter(s => s.businessId === businessId);
        }
        return sales;
    },

    saveSale(sale) {
        const sales = this.getSales();
        const index = sales.findIndex(s => s.id === sale.id);
        
        if (index >= 0) {
            sales[index] = { ...sales[index], ...sale };
        } else {
            sales.push(sale);
        }
        
        return this.set(this.KEYS.SALES, sales);
    },

    deleteSale(saleId) {
        const sales = this.getSales().filter(s => s.id !== saleId);
        return this.set(this.KEYS.SALES, sales);
    },

    // Loss Tracking
    getLosses(businessId) {
        const losses = JSON.parse(localStorage.getItem('losses') || '[]');
        if (businessId) {
            return losses.filter(loss => loss.businessId === businessId);
        }
        return losses;
    },
    
    saveLoss(loss) {
        const losses = JSON.parse(localStorage.getItem('losses') || '[]');
        const existingIndex = losses.findIndex(l => l.id === loss.id);
        
        if (existingIndex >= 0) {
            losses[existingIndex] = { ...losses[existingIndex], ...loss };
        } else {
            losses.push(loss);
        }
        
        localStorage.setItem('losses', JSON.stringify(losses));
    },
    
    deleteLoss(lossId) {
        const losses = JSON.parse(localStorage.getItem('losses') || '[]');
        const filtered = losses.filter(loss => loss.id !== lossId);
        localStorage.setItem('losses', JSON.stringify(filtered));
    },

    // Pinned Items Management
    getPinnedItems() {
        return this.get(this.KEYS.PINNED_ITEMS, []);
    },
    
    setPinnedItems(items) {
        return this.set(this.KEYS.PINNED_ITEMS, items);
    },
    
    addPinnedItem(item) {
        const pinnedItems = this.getPinnedItems();
        // Check if item is already pinned
        if (!pinnedItems.find(pinned => pinned.screen === item.screen)) {
            pinnedItems.push(item);
            return this.set(this.KEYS.PINNED_ITEMS, pinnedItems);
        }
        return false;
    },
    
    removePinnedItem(screen) {
        const pinnedItems = this.getPinnedItems();
        const filtered = pinnedItems.filter(item => item.screen !== screen);
        return this.set(this.KEYS.PINNED_ITEMS, filtered);
    },
    
    // Settings
    getSettings() {
        return this.get(this.KEYS.SETTINGS, {
            currency: '₹',
            taxRate: 18,
            lowStockThreshold: 10
        });
    },
    
    saveSettings(settings) {
        return this.set(this.KEYS.SETTINGS, settings);
    },
    
    // Export/Import all data
    exportData() {
        return {
            businesses: this.getAllBusinesses(),
            products: this.getProducts(),
            customers: this.getCustomers(),
            sales: this.getSales(),
            losses: this.getLosses(),
            settings: this.getSettings(),
            currentUser: this.getCurrentUser(),
            pinnedItems: this.getPinnedItems()
        };
    },
    
    importData(data) {
        if (data.businesses) this.set(this.KEYS.BUSINESSES, data.businesses);
        if (data.products) this.set(this.KEYS.PRODUCTS, data.products);
        if (data.customers) this.set(this.KEYS.CUSTOMERS, data.customers);
        if (data.sales) this.set(this.KEYS.SALES, data.sales);
        if (data.losses) localStorage.setItem('losses', JSON.stringify(data.losses));
        if (data.settings) this.set(this.KEYS.SETTINGS, data.settings);
        if (data.currentUser) this.set(this.KEYS.USER, data.currentUser);
        if (data.pinnedItems) this.set(this.KEYS.PINNED_ITEMS, data.pinnedItems);
    }
};

// Make globally available
window.Storage = Storage;