// ============================================
// SARAL - Navigation
// ============================================

const Navigation = {
    currentScreen: 'dashboard',
    
    init() {
        this.setupEventListeners();
        this.showScreen('dashboard');
    },
    
    setupEventListeners() {
        // Navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            // Remove existing event listeners to prevent duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', () => {
                const screen = newBtn.getAttribute('data-screen');
                this.showScreen(screen);
            });
        });
    },
    
    showScreen(screenName) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-screen') === screenName) {
                btn.classList.add('active');
            }
        });
        
        // Hide all content screens
        document.querySelectorAll('.content-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected screen
        const targetScreen = document.getElementById(`screen-${screenName}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            
            // Update page title
            const title = i18n.translate(screenName);
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = title;
            }
            
            // Load screen content
            this.loadScreen(screenName);
        }
        
        this.currentScreen = screenName;
        
        // Close mobile menu if open
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    },
    
    loadScreen(screenName) {
        switch (screenName) {
            case 'dashboard':
                if (window.Dashboard) {
                    try {
                        Dashboard.render();
                    } catch (error) {
                        console.error('Dashboard render error:', error);
                    }
                }
                break;
            case 'pos':
                if (window.POS) {
                    try {
                        POS.render();
                    } catch (error) {
                        console.error('POS render error:', error);
                    }
                }
                break;
            case 'products':
                if (window.Products) {
                    try {
                        Products.render();
                    } catch (error) {
                        console.error('Products render error:', error);
                    }
                }
                break;
            case 'inventory':
                if (window.Inventory) {
                    try {
                        Inventory.render();
                    } catch (error) {
                        console.error('Inventory render error:', error);
                    }
                }
                break;
            case 'customers':
                if (window.Customers) {
                    try {
                        Customers.render();
                    } catch (error) {
                        console.error('Customers render error:', error);
                    }
                }
                break;
            case 'sales':
                if (window.Sales) {
                    try {
                        Sales.render();
                    } catch (error) {
                        console.error('Sales render error:', error);
                    }
                }
                break;
            case 'loss-tracking':
                if (window.LossTracking) {
                    try {
                        LossTracking.render();
                    } catch (error) {
                        console.error('LossTracking render error:', error);
                    }
                }
                break;
            case 'analytics':
                if (window.Analytics) {
                    try {
                        Analytics.render();
                    } catch (error) {
                        console.error('Analytics render error:', error);
                    }
                }
                break;
            case 'settings':
                if (window.Settings) {
                    try {
                        Settings.render();
                    } catch (error) {
                        console.error('Settings render error:', error);
                    }
                }
                break;
        }
    },
    
    getCurrentScreen() {
        return this.currentScreen;
    }
};

// Make globally available
window.Navigation = Navigation;