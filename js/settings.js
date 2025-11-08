// ============================================
// SARAL - Settings & Configuration
// ============================================

const Settings = {
    init() {
        // Settings doesn't need initialization on app start
    },
    
    render() {
        const container = document.getElementById('screen-settings');
        const business = Storage.getCurrentBusiness();
        const settings = Storage.getSettings();
        
        if (!business) {
            container.innerHTML = '<p>No business selected</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="settings-container">
                <h3 style="margin-bottom: 20px;">Business Settings</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
                    <!-- Business Information -->
                    <div class="glass-card">
                        <h4 style="margin-bottom: 20px;">Business Information</h4>
                        <form id="business-info-form" style="display: flex; flex-direction: column; gap: 15px;">
                            <div class="form-group">
                                <label>Business Name</label>
                                <input type="text" id="business-name" class="form-input" value="${business.name}" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Business Type</label>
                                <select id="business-type" class="form-select">
                                    <option value="kirana" ${business.type === 'kirana' ? 'selected' : ''}>Kirana Store</option>
                                    <option value="grocery" ${business.type === 'grocery' ? 'selected' : ''}>Grocery Store</option>
                                    <option value="retail" ${business.type === 'retail' ? 'selected' : ''}>Retail Store</option>
                                    <option value="restaurant" ${business.type === 'restaurant' ? 'selected' : ''}>Restaurant</option>
                                    <option value="cafe" ${business.type === 'cafe' ? 'selected' : ''}>Café</option>
                                    <option value="bakery" ${business.type === 'bakery' ? 'selected' : ''}>Bakery</option>
                                    <option value="medical" ${business.type === 'medical' ? 'selected' : ''}>Medical Store</option>
                                    <option value="salon" ${business.type === 'salon' ? 'selected' : ''}>Salon/Spa</option>
                                    <option value="electronics" ${business.type === 'electronics' ? 'selected' : ''}>Electronics Store</option>
                                    <option value="other" ${business.type === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Business Address</label>
                                <textarea id="business-address" class="form-textarea" rows="3">${business.address || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="tel" id="business-phone" class="form-input" value="${business.phone || ''}">
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Update Business Info</button>
                        </form>
                    </div>
                    
                    <!-- Business Settings -->
                    <div class="glass-card">
                        <h4 style="margin-bottom: 20px;">Business Settings</h4>
                        <form id="business-settings-form" style="display: flex; flex-direction: column; gap: 15px;">
                            <div class="form-group">
                                <label>Currency Symbol</label>
                                <input type="text" id="currency-symbol" class="form-input" value="${settings.currency || '₹'}" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Tax Rate (%)</label>
                                <input type="number" id="tax-rate" class="form-input" min="0" max="100" step="0.1" value="${settings.taxRate || 18}" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Low Stock Threshold</label>
                                <input type="number" id="low-stock-threshold" class="form-input" min="0" value="${settings.lowStockThreshold || 10}" required>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Update Settings</button>
                        </form>
                    </div>
                    
                    <!-- Language & Localization -->
                    <div class="glass-card">
                        <h4 style="margin-bottom: 20px;">Language & Localization</h4>
                        <form id="language-form" style="display: flex; flex-direction: column; gap: 15px;">
                            <div class="form-group">
                                <label>Application Language</label>
                                <select id="app-language" class="form-select">
                                    <option value="en" ${i18n.currentLanguage === 'en' ? 'selected' : ''}>English</option>
                                    <option value="hi" ${i18n.currentLanguage === 'hi' ? 'selected' : ''}>हिंदी (Hindi)</option>
                                    <option value="ml" ${i18n.currentLanguage === 'ml' ? 'selected' : ''}>മലയാളം (Malayalam)</option>
                                    <option value="ta" ${i18n.currentLanguage === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
                                    <option value="te" ${i18n.currentLanguage === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
                                    <option value="bn" ${i18n.currentLanguage === 'bn' ? 'selected' : ''}>বাংলা (Bengali)</option>
                                    <option value="gu" ${i18n.currentLanguage === 'gu' ? 'selected' : ''}>ગુજરાતી (Gujarati)</option>
                                    <option value="kn" ${i18n.currentLanguage === 'kn' ? 'selected' : ''}>ಕನ್ನಡ (Kannada)</option>
                                    <option value="mr" ${i18n.currentLanguage === 'mr' ? 'selected' : ''}>मराठी (Marathi)</option>
                                    <option value="pa" ${i18n.currentLanguage === 'pa' ? 'selected' : ''}>ਪੰਜਾਬੀ (Punjabi)</option>
                                </select>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Update Language</button>
                        </form>
                    </div>
                    
                    <!-- Data Management -->
                    <div class="glass-card">
                        <h4 style="margin-bottom: 20px;">Data Management</h4>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <button class="btn btn-secondary" onclick="Settings.exportData()">
                                📤 Export Business Data
                            </button>
                            
                            <button class="btn btn-secondary" onclick="Settings.importData()">
                                📥 Import Business Data
                            </button>
                            
                            <button class="btn btn-danger" onclick="Settings.clearData()">
                                🗑️ Clear All Data
                            </button>
                            
                            <input type="file" id="import-file" accept=".json,.csv" style="display: none;" onchange="Settings.handleImportFile(this.files[0])">
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Setup form event listeners
        document.getElementById('business-info-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateBusinessInfo();
        });
        
        document.getElementById('business-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateBusinessSettings();
        });
        
        document.getElementById('language-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateLanguage();
        });
    },
    
    updateBusinessInfo() {
        const business = Storage.getCurrentBusiness();
        if (!business) return;
        
        business.name = document.getElementById('business-name').value.trim();
        business.type = document.getElementById('business-type').value;
        business.address = document.getElementById('business-address').value.trim();
        business.phone = document.getElementById('business-phone').value.trim();
        
        Storage.saveBusiness(business);
        Storage.setCurrentBusiness(business);
        
        // Update business name in sidebar
        document.getElementById('current-business-name').textContent = business.name;
        
        Utils.showNotification('Business information updated successfully!', 'success');
    },
    
    updateBusinessSettings() {
        const settings = Storage.getSettings();
        
        settings.currency = document.getElementById('currency-symbol').value.trim();
        settings.taxRate = parseFloat(document.getElementById('tax-rate').value);
        settings.lowStockThreshold = parseInt(document.getElementById('low-stock-threshold').value);
        
        Storage.saveSettings(settings);
        
        Utils.showNotification('Business settings updated successfully!', 'success');
    },
    
    updateLanguage() {
        const language = document.getElementById('app-language').value;
        i18n.setLanguage(language);
        
        // Update language selectors across the app
        document.getElementById('language-select').value = language;
        document.getElementById('language-select-auth').value = language;
        
        // Re-render current screen to apply translations
        const currentScreen = Navigation.getCurrentScreen();
        Navigation.loadScreen(currentScreen);
        
        Utils.showNotification('Language updated successfully!', 'success');
    },
    
    exportData() {
        const data = Storage.exportData();
        const filename = `saral-export-${new Date().toISOString().split('T')[0]}.json`;
        Utils.downloadFile(JSON.stringify(data, null, 2), filename);
        Utils.showNotification('Data exported successfully!', 'success');
    },
    
    importData() {
        document.getElementById('import-file').click();
    },
    
    handleImportFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                Storage.importData(data);
                Utils.showNotification('Data imported successfully!', 'success');
                
                // Refresh current view
                const currentScreen = Navigation.getCurrentScreen();
                Navigation.loadScreen(currentScreen);
            } catch (error) {
                Utils.showNotification('Error importing data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    },
    
    async clearData() {
        const confirmed = await Utils.confirm(
            'Are you sure you want to clear all business data? This action cannot be undone.',
            'Clear All Data'
        );
        
        if (confirmed) {
            // Clear all business-related data
            const business = Storage.getCurrentBusiness();
            if (business) {
                // Clear products, customers, sales for this business
                const products = Storage.getProducts(business.id);
                const customers = Storage.getCustomers(business.id);
                const sales = Storage.getSales(business.id);
                
                products.forEach(product => Storage.deleteProduct(product.id));
                customers.forEach(customer => Storage.deleteCustomer(customer.id));
                sales.forEach(sale => Storage.deleteSale(sale.id));
            }
            
            Utils.showNotification('All business data cleared successfully!', 'success');
            
            // Refresh current view
            const currentScreen = Navigation.getCurrentScreen();
            Navigation.loadScreen(currentScreen);
        }
    }
};

// Make globally available
window.Settings = Settings;