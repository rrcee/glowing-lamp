// ============================================
// SARAL - Utility Functions
// ============================================

const Utils = {
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // Format currency (INR)
    formatCurrency(amount, currency = '₹') {
        const num = parseFloat(amount) || 0;
        return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    // Format date
    formatDate(date, format = 'short') {
        const d = date instanceof Date ? date : new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } else if (format === 'long') {
            return d.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (format === 'time') {
            return d.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return d.toLocaleDateString('en-IN');
    },

    // Format number
    formatNumber(num) {
        return parseFloat(num || 0).toLocaleString('en-IN');
    },

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    // Validate phone (Indian)
    validatePhone(phone) {
        const re = /^[6-9]\d{9}$/;
        return re.test(String(phone).replace(/\D/g, ''));
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Sleep/delay
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Get query parameter
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // Download file
    downloadFile(content, filename, type = 'application/json') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    // Confirm dialog
    async confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content glass-card" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>${Utils.sanitizeHTML(title)}</h3>
                    </div>
                    <p style="margin-bottom: 24px; color: var(--text-secondary);">
                        ${Utils.sanitizeHTML(message)}
                    </p>
                    <div class="form-actions">
                        <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
                        <button class="btn btn-primary" id="confirm-ok">OK</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('#confirm-ok').onclick = () => {
                modal.remove();
                resolve(true);
            };

            modal.querySelector('#confirm-cancel').onclick = () => {
                modal.remove();
                resolve(false);
            };

            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            };
        });
    },

    // Calculate percentage
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    },

    // Calculate change percentage
    calculateChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    },

    // Group array by key
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            result[group] = result[group] || [];
            result[group].push(item);
            return result;
        }, {});
    },

    // Sort array
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    // Filter array
    filterBy(array, filters) {
        return array.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === '' || value === null || value === undefined) return true;
                return item[key] === value;
            });
        });
    },

    // Search array
    searchArray(array, searchTerm, keys) {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return array;

        return array.filter(item => {
            return keys.some(key => {
                const value = String(item[key] || '').toLowerCase();
                return value.includes(term);
            });
        });
    },

    // Calculate sum
    sum(array, key) {
        return array.reduce((total, item) => total + (parseFloat(item[key]) || 0), 0);
    },

    // Calculate average
    average(array, key) {
        if (array.length === 0) return 0;
        return Utils.sum(array, key) / array.length;
    },

    // Get unique values
    unique(array, key) {
        if (key) {
            return [...new Set(array.map(item => item[key]))];
        }
        return [...new Set(array)];
    },

    // Truncate text
    truncate(text, length = 50, suffix = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + suffix;
    },

    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Title case
    titleCase(str) {
        return str.split(' ').map(word => Utils.capitalize(word)).join(' ');
    },

    // Check if mobile device
    isMobile() {
        return window.innerWidth <= 768;
    },

    // Check if online
    isOnline() {
        return navigator.onLine;
    },

    // Generate random color
    randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    },

    // Parse CSV
    parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            const values = lines[i].split(',');
            const obj = {};
            headers.forEach((header, index) => {
                obj[header.trim()] = values[index]?.trim();
            });
            data.push(obj);
        }

        return data;
    },

    // Export to CSV
    exportToCSV(data, filename = 'export.csv') {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header] || '').join(','))
        ].join('\n');

        Utils.downloadFile(csv, filename, 'text/csv');
    }
};

// Make Utils globally available
window.Utils = Utils;
