// ============================================
// SARAL - Initialization Checker
// ============================================

// This script helps diagnose initialization issues
(function() {
    'use strict';
    
    // Check if all required global objects exist
    const requiredGlobals = [
        'Utils', 'Storage', 'i18n', 'Auth', 'Business', 
        'Navigation', 'Dashboard', 'POS', 'Products', 
        'Customers', 'Sales', 'Inventory', 'LossTracking',
        'Analytics', 'Settings', 'AIAssistant', 'App'
    ];
    
    console.log('=== SARAL Initialization Checker ===');
    
    // Check for missing globals
    const missingGlobals = requiredGlobals.filter(global => {
        const exists = typeof window[global] !== 'undefined';
        if (!exists) {
            console.error(`❌ Missing global: ${global}`);
        } else {
            console.log(`✅ Found global: ${global}`);
        }
        return !exists;
    });
    
    if (missingGlobals.length === 0) {
        console.log('✅ All required globals are present');
    } else {
        console.warn(`⚠️ ${missingGlobals.length} globals are missing`);
    }
    
    // Check localStorage access
    try {
        localStorage.setItem('saral_test', 'test');
        localStorage.removeItem('saral_test');
        console.log('✅ localStorage is accessible');
    } catch (e) {
        console.error('❌ localStorage is not accessible:', e.message);
    }
    
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        console.log('⚠️ DOM is still loading');
    } else {
        console.log('✅ DOM is ready');
    }
    
    // Check for required DOM elements
    const requiredElements = [
        'splash-screen', 'auth-screen', 'register-screen', 
        'setup-screen', 'main-app', 'notification-container'
    ];
    
    const missingElements = requiredElements.filter(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`❌ Missing element: #${id}`);
        } else {
            console.log(`✅ Found element: #${id}`);
        }
        return !element;
    });
    
    if (missingElements.length === 0) {
        console.log('✅ All required DOM elements are present');
    } else {
        console.warn(`⚠️ ${missingElements.length} DOM elements are missing`);
    }
    
    console.log('=== End Initialization Checker ===');
    
    // Auto-initialize if not already initialized
    if (typeof App !== 'undefined' && !App.isInitialized) {
        console.log('🔄 Attempting to initialize app...');
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (typeof App !== 'undefined') {
                    App.init().catch(err => {
                        console.error('App initialization failed:', err);
                    });
                }
            }, 100);
        });
    }
})();