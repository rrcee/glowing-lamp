// ============================================
// SARAL - Authentication
// ============================================

const Auth = {
    currentUser: null,
    
    init() {
        this.currentUser = Storage.getCurrentUser();
        this.setupEventListeners();
        return !!this.currentUser;
    },
    
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            // Remove existing event listeners to prevent duplicates
            const newLoginForm = loginForm.cloneNode(true);
            loginForm.parentNode.replaceChild(newLoginForm, loginForm);
            
            newLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            // Remove existing event listeners to prevent duplicates
            const newRegisterForm = registerForm.cloneNode(true);
            registerForm.parentNode.replaceChild(newRegisterForm, registerForm);
            
            newRegisterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // Show/hide forms
        const showRegister = document.getElementById('show-register');
        if (showRegister) {
            // Remove existing event listeners to prevent duplicates
            const newShowRegister = showRegister.cloneNode(true);
            showRegister.parentNode.replaceChild(newShowRegister, showRegister);
            
            newShowRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterScreen();
            });
        }
        
        const showLogin = document.getElementById('show-login');
        if (showLogin) {
            // Remove existing event listeners to prevent duplicates
            const newShowLogin = showLogin.cloneNode(true);
            showLogin.parentNode.replaceChild(newShowLogin, showLogin);
            
            newShowLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginScreen();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            // Remove existing event listeners to prevent duplicates
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            
            newLogoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    },
    
    showLoginScreen() {
        const registerScreen = document.getElementById('register-screen');
        const authScreen = document.getElementById('auth-screen');
        
        if (registerScreen) registerScreen.classList.add('hidden');
        if (authScreen) authScreen.classList.remove('hidden');
    },
    
    showRegisterScreen() {
        const authScreen = document.getElementById('auth-screen');
        const registerScreen = document.getElementById('register-screen');
        
        if (authScreen) authScreen.classList.add('hidden');
        if (registerScreen) registerScreen.classList.remove('hidden');
    },
    
    async handleLogin() {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (!emailInput || !passwordInput) {
            Utils.showNotification('Login form elements not found', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validate inputs
        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Please enter a valid email', 'error');
            return;
        }
        
        if (password.length < 6) {
            Utils.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Find user
        const users = Storage.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            Utils.showNotification('Invalid email or password', 'error');
            return;
        }
        
        // Login successful
        this.currentUser = user;
        Storage.setCurrentUser(user);
        
        Utils.showNotification('Login successful!', 'success');
        
        // Check if user has businesses
        const businesses = Storage.getAllBusinesses(user.id);
        
        if (businesses.length === 0) {
            // Show business setup
            this.showSetupScreen();
        } else {
            // Load first business and show app
            Storage.setCurrentBusiness(businesses[0]);
            this.showMainApp();
        }
    },
    
    async handleRegister() {
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        
        if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            Utils.showNotification('Registration form elements not found', 'error');
            return;
        }
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate inputs
        if (!name) {
            Utils.showNotification('Please enter your name', 'error');
            return;
        }
        
        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Please enter a valid email', 'error');
            return;
        }
        
        if (password.length < 6) {
            Utils.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            Utils.showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Check if email already exists
        const users = Storage.getAllUsers();
        if (users.find(u => u.email === email)) {
            Utils.showNotification('Email already registered', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Utils.generateId(),
            name,
            email,
            password, // In production, this should be hashed!
            createdAt: new Date().toISOString()
        };
        
        // Save user
        Storage.saveUser(newUser);
        this.currentUser = newUser;
        Storage.setCurrentUser(newUser);
        
        Utils.showNotification('Account created successfully!', 'success');
        
        // Show business setup
        this.showSetupScreen();
    },
    
    showSetupScreen() {
        const authScreen = document.getElementById('auth-screen');
        const registerScreen = document.getElementById('register-screen');
        const setupScreen = document.getElementById('setup-screen');
        
        if (authScreen) authScreen.classList.add('hidden');
        if (registerScreen) registerScreen.classList.add('hidden');
        if (setupScreen) setupScreen.classList.remove('hidden');
    },
    
    showMainApp() {
        const authScreen = document.getElementById('auth-screen');
        const registerScreen = document.getElementById('register-screen');
        const setupScreen = document.getElementById('setup-screen');
        const mainApp = document.getElementById('main-app');
        
        if (authScreen) authScreen.classList.add('hidden');
        if (registerScreen) registerScreen.classList.add('hidden');
        if (setupScreen) setupScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        // Initialize app modules
        if (window.App && typeof App.initializeModules === 'function') {
            App.initializeModules();
        }
    },
    
    async logout() {
        const confirmed = await Utils.confirm('Are you sure you want to logout?', 'Logout');
        
        if (confirmed) {
            this.currentUser = null;
            Storage.removeCurrentUser();
            Storage.setCurrentBusiness(null);
            
            // Hide main app and show auth
            const mainApp = document.getElementById('main-app');
            const authScreen = document.getElementById('auth-screen');
            
            if (mainApp) mainApp.classList.add('hidden');
            if (authScreen) authScreen.classList.remove('hidden');
            
            Utils.showNotification('Logged out successfully', 'success');
        }
    },
    
    isAuthenticated() {
        return !!this.currentUser;
    },
    
    getCurrentUser() {
        return this.currentUser;
    }
};

// Make globally available
window.Auth = Auth;