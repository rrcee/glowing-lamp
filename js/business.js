
11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111// ============================================
// SARAL - Business Management
// ============================================

const Business = {
    currentBusiness: null,
    
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const setupForm = document.getElementById('business-setup-form');
        if (setupForm) {
            setupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createBusiness();
            });
        }
    },
    
    async createBusiness() {
        const name = document.getElementById('business-name').value.trim();
        const type = document.getElementById('business-type').value;
        const address = document.getElementById('business-address').value.trim();
        const phone = document.getElementById('business-phone').value.trim();
        
        // Validate
        if (!name) {
            Utils.showNotification('Please enter business name', 'error');
            return;
        }
        
        if (!type) {
            Utils.showNotification('Please select business type', 'error');
            return;
        }
        
        // Get current user
        const user = Auth.getCurrentUser();
        if (!user) {
            Utils.showNotification('User not authenticated', 'error');
            return;
        }
        
        // Check business limit (30)
        const existingBusinesses = Storage.getAllBusinesses(user.id);
        if (existingBusinesses.length >= 30) {
            Utils.showNotification('Maximum 30 businesses allowed per account', 'error');
            return;
        }
        
        // Create business object
        const business = {
            id: Utils.generateId(),
            userId: user.id,
            name,
            type,
            address,
            phone,
            createdAt: new Date().toISOString(),
            settings: {
                currency: '₹',
                taxRate: 18,
                lowStockThreshold: 10
            }
        };
        
        // Save business
        Storage.saveBusiness(business);
        Storage.setCurrentBusiness(business);
        
        Utils.showNotification(`Business "${name}" created successfully!`, 'success');
        
        // Show main app
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Initialize app
        if (window.App) {
            App.currentBusiness = business;
            App.initializeModules();
        }
    },
    
    getAllBusinesses() {
        const user = Auth.getCurrentUser();
        if (!user) return [];
        return Storage.getAllBusinesses(user.id);
    },
    
    switchBusiness(businessId) {
        const businesses = this.getAllBusinesses();
        const business = businesses.find(b => b.id === businessId);
        
        if (business) {
            Storage.setCurrentBusiness(business);
            this.currentBusiness = business;
            
            // Reload app with new business
            window.location.reload();
        }
    },
    
    deleteBusiness(businessId) {
        Storage.deleteBusiness(businessId);
        
        const remaining = this.getAllBusinesses();
        if (remaining.length > 0) {
            this.switchBusiness(remaining[0].id);
        } else {
            // No businesses left, show setup
            document.getElementById('main-app').classList.add('hidden');
            document.getElementById('setup-screen').classList.remove('hidden');
        }
    },
    
    saveBusiness() {
        const name = document.getElementById('business-name').value.trim();
        const type = document.getElementById('business-type').value;
        const address = document.getElementById('business-address').value.trim();
        const phone = document.getElementById('business-phone').value.trim();
        
        if (!name) {
            Utils.showNotification('Business name is required', 'error');
            return;
        }
        
        const user = Auth.getCurrentUser();
        if (!user) {
            Utils.showNotification('User not authenticated', 'error');
            return;
        }
        
        const business = {
            id: this.editingBusinessId || Utils.generateId(),
            userId: user.id,
            name,
            type,
            address: address || undefined,
            phone: phone || undefined,
            createdAt: this.editingBusinessId ? undefined : new Date().toISOString()
        };
        
        Storage.saveBusiness(business);
        
        // If this is the first business or we're editing the current business, update current business
        const currentBusiness = Storage.getCurrentBusiness();
        if (!currentBusiness || business.id === currentBusiness.id) {
            Storage.setCurrentBusiness(business);
        }
        
        // Update business selector in app
        if (window.App) {
            App.initializeBusinessSelector();
        }
        
        // Close modal
        document.querySelector('.modal')?.remove();
        
        // Refresh setup screen or switch to dashboard
        if (document.getElementById('setup-screen') && document.getElementById('setup-screen').classList.contains('hidden')) {
            // We're in main app, refresh current screen
            if (window.Navigation) {
                const currentScreen = Navigation.getCurrentScreen();
                Navigation.loadScreen(currentScreen);
            }
        } else {
            // We're in setup, initialize app
            if (window.App) {
                App.currentBusiness = business;
                App.initializeModules();
                const setupScreen = document.getElementById('setup-screen');
                const mainApp = document.getElementById('main-app');
                if (setupScreen) setupScreen.classList.add('hidden');
                if (mainApp) mainApp.classList.remove('hidden');
            }
        }
        
        Utils.showNotification(
            this.editingBusinessId ? 'Business updated successfully!' : 'Business created successfully!', 
            'success'
        );
    }
};

// Make globally available
window.Business = Business;
