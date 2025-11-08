// ============================================
// SARAL - Main Application
// ============================================

const App = {
    version: '1.0.0',
    isInitialized: false,
    currentBusiness: null,
    
    async init() {
        try {
            console.log('Initializing SARAL v' + this.version);
            
            // Show splash screen
            await this.showSplashScreen();
            
            // Initialize translations
            if (typeof i18n !== 'undefined' && i18n.init) {
                try {
                    i18n.init();
                } catch (error) {
                    console.error('Translation initialization error:', error);
                }
            }
            
            // Initialize authentication
            let isAuthenticated = false;
            if (typeof Auth !== 'undefined' && Auth.init) {
                try {
                    isAuthenticated = Auth.init();
                } catch (error) {
                    console.error('Auth initialization error:', error);
                }
            }
            
            if (!isAuthenticated) {
                // Show auth screen
                const splashScreen = document.getElementById('splash-screen');
                const authScreen = document.getElementById('auth-screen');
                if (splashScreen) splashScreen.classList.add('hidden');
                if (authScreen) authScreen.classList.remove('hidden');
            } else {
                // Check if user has businesses
                const user = Auth.getCurrentUser();
                if (user) {
                    let businesses = [];
                    try {
                        businesses = Storage.getAllBusinesses(user.id);
                    } catch (error) {
                        console.error('Business retrieval error:', error);
                        businesses = [];
                    }
                    
                    if (businesses.length === 0) {
                        // Show business setup
                        const splashScreen = document.getElementById('splash-screen');
                        const setupScreen = document.getElementById('setup-screen');
                        if (splashScreen) splashScreen.classList.add('hidden');
                        if (setupScreen) setupScreen.classList.remove('hidden');
                        if (typeof Business !== 'undefined' && Business.init) {
                            try {
                                Business.init();
                            } catch (error) {
                                console.error('Business initialization error:', error);
                            }
                        }
                    } else {
                        // Load business and show app
                        this.currentBusiness = Storage.getCurrentBusiness() || businesses[0];
                        if (this.currentBusiness) {
                            try {
                                Storage.setCurrentBusiness(this.currentBusiness);
                            } catch (error) {
                                console.error('Current business setting error:', error);
                            }
                        }
                        
                        const splashScreen = document.getElementById('splash-screen');
                        const mainApp = document.getElementById('main-app');
                        if (splashScreen) splashScreen.classList.add('hidden');
                        if (mainApp) mainApp.classList.remove('hidden');
                        
                        // Initialize all modules
                        try {
                            await this.initializeModules();
                        } catch (error) {
                            console.error('Module initialization error:', error);
                        }
                    }
                }
            }
            
            // Setup global event listeners
            try {
                this.setupGlobalListeners();
            } catch (error) {
                console.error('Global listener setup error:', error);
            }
            
            this.isInitialized = true;
            console.log('SARAL initialized successfully');
            
        } catch (error) {
            console.error('Critical initialization error:', error);
            // Try to show error in UI
            const errorContainer = document.getElementById('notification-container');
            if (errorContainer) {
                errorContainer.innerHTML = `
                    <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
                                background: #EF4444; color: white; padding: 15px 20px; 
                                border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                        <strong>Initialization Error:</strong> ${error.message || 'Unknown error occurred'}
                        <br>Please refresh the page or check browser console for details.
                    </div>
                `;
            }
            Utils.showNotification('Failed to initialize app. Please refresh.', 'error');
        }
    },
    
    async showSplashScreen() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const splash = document.getElementById('splash-screen');
                if (splash) {
                    splash.classList.add('hidden');
                }
                resolve();
            }, 2000);
        });
    },
    
    async initializeModules() {
        // Update business name in sidebar
        if (this.currentBusiness) {
            const businessNameElement = document.getElementById('current-business-name');
            if (businessNameElement) {
                businessNameElement.textContent = this.currentBusiness.name;
            }
        }
        
        // Initialize business selector
        this.initializeBusinessSelector();
        
        // Initialize default pinned items if none exist
        this.initializeDefaultPinnedItems();
        
        // Initialize navigation
        if (window.Navigation) {
            try {
                Navigation.init();
            } catch (error) {
                console.error('Navigation initialization error:', error);
            }
        }
        
        // Initialize dashboard (default view)
        if (window.Dashboard) {
            try {
                Dashboard.init();
            } catch (error) {
                console.error('Dashboard initialization error:', error);
            }
        }
        
        // Apply translations
        if (typeof i18n !== 'undefined' && i18n.applyTranslations) {
            try {
                i18n.applyTranslations();
            } catch (error) {
                console.error('Translation application error:', error);
            }
        }
        
        // Add dummy data if needed
        try {
            this.addDummyData();
        } catch (error) {
            console.error('Dummy data addition error:', error);
        }
    },
    
    initializeDefaultPinnedItems() {
        // Check if pinned items already exist
        const pinnedItems = Storage.getPinnedItems();
        
        // If no pinned items exist, add default ones
        if (pinnedItems.length === 0) {
            const defaultPinnedItems = [
                { screen: 'pos', icon: '💰', label: 'pos' },
                { screen: 'products', icon: '📦', label: 'products' },
                { screen: 'sales', icon: '💳', label: 'sales' }
            ];
            
            defaultPinnedItems.forEach(item => {
                Storage.addPinnedItem(item);
            });
        }
    },
    
    initializeBusinessSelector() {
        const businessSelector = document.getElementById('business-selector');
        if (!businessSelector) return;
        
        const user = Auth.getCurrentUser();
        if (!user) return;
        
        const businesses = Storage.getAllBusinesses(user.id);
        const currentBusiness = Storage.getCurrentBusiness();
        
        // Clear existing options
        businessSelector.innerHTML = '';
        
        // Add businesses to selector
        businesses.forEach(business => {
            const option = document.createElement('option');
            option.value = business.id;
            option.textContent = business.name;
            if (currentBusiness && business.id === currentBusiness.id) {
                option.selected = true;
            }
            businessSelector.appendChild(option);
        });
        
        // Remove any existing event listeners to prevent duplicates
        const newBusinessSelector = businessSelector.cloneNode(true);
        businessSelector.parentNode.replaceChild(newBusinessSelector, businessSelector);
        
        // Add event listener for business switching
        newBusinessSelector.addEventListener('change', (e) => {
            const selectedBusinessId = e.target.value;
            if (selectedBusinessId) {
                this.switchBusiness(selectedBusinessId);
            }
        });
    },
    
    switchBusiness(businessId) {
        const user = Auth.getCurrentUser();
        if (!user) return;
        
        const businesses = Storage.getAllBusinesses(user.id);
        const selectedBusiness = businesses.find(b => b.id === businessId);
        
        if (selectedBusiness) {
            // Update current business in storage
            Storage.setCurrentBusiness(selectedBusiness);
            this.currentBusiness = selectedBusiness;
            
            // Update business name in sidebar
            const businessNameElement = document.getElementById('current-business-name');
            if (businessNameElement) {
                businessNameElement.textContent = selectedBusiness.name;
            }
            
            // Refresh current screen
            if (window.Navigation) {
                const currentScreen = Navigation.getCurrentScreen();
                Navigation.loadScreen(currentScreen);
            }
            
            // Reinitialize business selector to ensure it's up to date
            this.initializeBusinessSelector();
            
            Utils.showNotification(`Switched to ${selectedBusiness.name}`, 'success');
        }
    },
    
    addDummyData() {
        const business = Storage.getCurrentBusiness();
        if (!business) return;
        
        // Check if we already have data
        const products = Storage.getProducts(business.id);
        const customers = Storage.getCustomers(business.id);
        const sales = Storage.getSales(business.id);
        
        // Add dummy products if none exist
        if (products.length === 0) {
            const dummyProducts = [
                { name: "Milk", category: "Dairy", price: 60, stock: 50, sku: "MLK001" },
                { name: "Bread", category: "Bakery", price: 40, stock: 30, sku: "BRD001" },
                { name: "Eggs (12 pcs)", category: "Dairy", price: 80, stock: 25, sku: "EGG001" },
                { name: "Apples (1 kg)", category: "Fruits", price: 120, stock: 20, sku: "APL001" },
                { name: "Rice (5 kg)", category: "Grocery", price: 250, stock: 15, sku: "RCE001" },
                { name: "Cooking Oil (1 L)", category: "Grocery", price: 180, stock: 12, sku: "OIL001" },
                { name: "Toothpaste", category: "Personal Care", price: 75, stock: 40, sku: "TTP001" },
                { name: "Shampoo", category: "Personal Care", price: 150, stock: 20, sku: "SHM001" }
            ];
            
            dummyProducts.forEach(product => {
                const productObj = {
                    id: Utils.generateId(),
                    businessId: business.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    stock: product.stock,
                    sku: product.sku,
                    createdAt: new Date().toISOString()
                };
                Storage.saveProduct(productObj);
            });
            
            Utils.showNotification('Added sample products for demonstration', 'info');
        }
        
        // Add dummy customers if none exist
        if (customers.length === 0) {
            const dummyCustomers = [
                { name: "Rajesh Kumar", email: "rajesh@example.com", phone: "9876543210", address: "123 Main St, Mumbai" },
                { name: "Priya Sharma", email: "priya@example.com", phone: "9876543211", address: "456 Park Ave, Delhi" },
                { name: "Amit Patel", email: "amit@example.com", phone: "9876543212", address: "789 Market Rd, Bangalore" },
                { name: "Sunita Devi", email: "sunita@example.com", phone: "9876543213", address: "101 Church Lane, Kolkata" },
                { name: "Vikram Singh", email: "vikram@example.com", phone: "9876543214", address: "202 Hill St, Chennai" }
            ];
            
            dummyCustomers.forEach(customer => {
                const customerObj = {
                    id: Utils.generateId(),
                    businessId: business.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    createdAt: new Date().toISOString()
                };
                Storage.saveCustomer(customerObj);
            });
            
            Utils.showNotification('Added sample customers for demonstration', 'info');
        }
    },
    
    setupGlobalListeners() {
        // Language selector
        const langSelect = document.getElementById('language-select');
        const langSelectAuth = document.getElementById('language-select-auth');
        
        if (langSelect) {
            // Remove existing event listeners to prevent duplicates
            const newLangSelect = langSelect.cloneNode(true);
            langSelect.parentNode.replaceChild(newLangSelect, langSelect);
            
            newLangSelect.value = i18n.currentLanguage;
            newLangSelect.addEventListener('change', (e) => {
                i18n.setLanguage(e.target.value);
                if (langSelectAuth) langSelectAuth.value = e.target.value;
            });
        }
        
        if (langSelectAuth) {
            // Remove existing event listeners to prevent duplicates
            const newLangSelectAuth = langSelectAuth.cloneNode(true);
            langSelectAuth.parentNode.replaceChild(newLangSelectAuth, langSelectAuth);
            
            newLangSelectAuth.value = i18n.currentLanguage;
            newLangSelectAuth.addEventListener('change', (e) => {
                i18n.setLanguage(e.target.value);
                if (langSelect) langSelect.value = e.target.value;
            });
        }
        
        // Apply initial translations
        try {
            i18n.applyTranslations();
        } catch (error) {
            console.error('Translation application error:', error);
        }
        
        // Update header button styling on language change
        document.removeEventListener('languageChanged', this.languageChangedHandler);
        this.languageChangedHandler = () => {
            // Re-apply button styling classes if needed
            const headerButtons = document.querySelectorAll('.topbar-actions .btn');
            headerButtons.forEach(button => {
                if (!button.classList.contains('btn-header')) {
                    button.classList.add('btn-header');
                }
            });
        };
        document.addEventListener('languageChanged', this.languageChangedHandler);
        
        // Sidebar toggle functionality
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const contentArea = document.querySelector('.content-area');
        
        if (sidebarToggle && sidebar && contentArea) {
            // Remove existing event listeners to prevent duplicates
            const newSidebarToggle = sidebarToggle.cloneNode(true);
            sidebarToggle.parentNode.replaceChild(newSidebarToggle, sidebarToggle);
            
            newSidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                contentArea.classList.toggle('sidebar-collapsed');
            });
        }
        
        // Hamburger menu (mobile)
        const hamburger = document.getElementById('hamburger-menu');
        const sidebarNav = document.querySelector('.sidebar');
        
        if (hamburger && sidebarNav) {
            // Remove existing event listeners to prevent duplicates
            const newHamburger = hamburger.cloneNode(true);
            hamburger.parentNode.replaceChild(newHamburger, hamburger);
            
            newHamburger.addEventListener('click', () => {
                sidebarNav.classList.toggle('active');
            });
            
            // Close sidebar when clicking outside
            document.removeEventListener('click', this.sidebarClickHandler);
            this.sidebarClickHandler = (e) => {
                if (!sidebarNav.contains(e.target) && !newHamburger.contains(e.target)) {
                    sidebarNav.classList.remove('active');
                }
            };
            document.addEventListener('click', this.sidebarClickHandler);
        }
        
        // AI Assistant button
        const aiAssistantBtn = document.getElementById('ai-assistant-btn');
        if (aiAssistantBtn) {
            // Remove existing event listeners to prevent duplicates
            const newAiAssistantBtn = aiAssistantBtn.cloneNode(true);
            aiAssistantBtn.parentNode.replaceChild(newAiAssistantBtn, aiAssistantBtn);
            
            newAiAssistantBtn.addEventListener('click', () => {
                if (window.AIAssistant) AIAssistant.open();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            // Remove existing event listeners to prevent duplicates
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            
            newLogoutBtn.addEventListener('click', () => {
                if (window.Auth) Auth.logout();
            });
        }
        
        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            // Remove existing event listeners to prevent duplicates
            const newHelpBtn = helpBtn.cloneNode(true);
            helpBtn.parentNode.replaceChild(newHelpBtn, helpBtn);
            
            newHelpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }
        
        // Keyboard shortcuts
        document.removeEventListener('keydown', this.keydownHandler);
        this.keydownHandler = (e) => {
            // Ctrl/Cmd + K: AI Assistant
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (window.AIAssistant) AIAssistant.toggle();
            }
            
            // Esc: Close modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal:not(.hidden)');
                if (modal) {
                    modal.classList.add('hidden');
                }
            }
        };
        document.addEventListener('keydown', this.keydownHandler);
        
        // Online/offline detection
        window.removeEventListener('online', this.onlineHandler);
        this.onlineHandler = () => {
            Utils.showNotification('You are back online!', 'success');
        };
        window.addEventListener('online', this.onlineHandler);
        
        window.removeEventListener('offline', this.offlineHandler);
        this.offlineHandler = () => {
            Utils.showNotification('You are offline. Changes will sync when online.', 'warning');
        };
        window.addEventListener('offline', this.offlineHandler);
    },
    
    showHelp() {
        const helpContent = `
            <div class="modal">
                <div class="modal-content glass-card">
                    <div class="modal-header">
                        <h3>⌨️ <span data-translate="keyboard_shortcuts">Keyboard Shortcuts</span></h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div style="display: grid; gap: 12px;">
                        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 12px; align-items: center;">
                            <strong style="color: var(--primary);">Ctrl + K</strong>
                            <span data-translate="open_ai_assistant">Open AI Assistant</span>
                        </div>
                        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 12px; align-items: center;">
                            <strong style="color: var(--primary);">Esc</strong>
                            <span data-translate="close_modal">Close Modal</span>
                        </div>
                    </div>
                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--glass-border); color: var(--text-secondary); font-size: 0.9rem;">
                        <p><strong data-translate="version">Version:</strong> ${this.version}</p>
                        <p><strong data-translate="about">About:</strong> <span data-translate="app_description">SARAL - Simple, Smart Business Management for Indian SMEs</span></p>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('modal-container');
        if (container) {
            container.innerHTML = helpContent;
        }
    },
    
    getCurrentBusiness() {
        return this.currentBusiness;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all scripts are loaded
    setTimeout(() => {
        if (window.App) {
            App.init();
        } else {
            console.error('App module not found');
        }
    }, 100);
});

// Make App globally available
window.App = App;