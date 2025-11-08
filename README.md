# SARAL - Business Management Application

**SARAL** (सरल) means "simple" in Hindi. This is a comprehensive business management application designed specifically for small business owners in India, supporting over 30 different business types.

## Features

### Authentication & User Management
- Secure login and registration system
- Multi-business support (up to 30 businesses per user)
- Remember me functionality
- Responsive design for all devices

### Business Management
- Business setup with 30+ business type options
- Business switching capability
- Business-specific data isolation

### Point of Sale (POS)
- Quick sale functionality
- Product search and selection
- Cart management
- Tax calculation (18% GST)
- Real-time stock updates

### Product Management
- Add, edit, and delete products
- Product categorization
- SKU tracking
- Stock quantity management
- Search and filter capabilities

### Dashboard & Analytics
- Real-time sales metrics
- Inventory status overview
- Low stock alerts
- Customer metrics
- Recent sales history

### Multilingual Support
- English, Hindi, Malayalam, and 10+ Indian languages
- Language switching capability
- Localized UI elements

### Data Management
- Local storage with IndexedDB backup
- Import/export functionality
- Automatic data backup
- Data persistence across sessions

### Progressive Web App (PWA)
- Offline capability
- Installable on mobile devices
- Fast loading with service worker caching
- Responsive design for all screen sizes

## Supported Business Types

1. **Retail & Grocery**
   - Kirana Store
   - Grocery Store
   - Supermarket
   - General Retail Store

2. **Food & Beverages**
   - Restaurant
   - Café / Coffee Shop
   - Bakery
   - Fast Food / Takeaway
   - Sweet Shop / Mithai

3. **Healthcare**
   - Medical Store / Pharmacy
   - Clinic / Hospital

4. **Fashion & Beauty**
   - Garments / Clothing
   - Boutique
   - Salon / Beauty Parlor
   - Barber Shop
   - Spa / Wellness Center

5. **Electronics & Technology**
   - Electronics Store
   - Mobile / Accessories Shop
   - Computer / IT Services

6. **Automobile**
   - Auto Mechanic / Garage
   - Car Wash / Detailing
   - Petrol Pump

7. **Other Services**
   - Photography Studio
   - Gym / Fitness Center
   - Tuition / Coaching Center
   - Laundry / Dry Cleaning
   - Tailoring / Alteration
   - General Business / Other

## Technical Architecture

### Frontend
- Vanilla JavaScript (no frameworks for maximum compatibility)
- Modern CSS with Flexbox and Grid
- Responsive design with mobile-first approach
- Glassmorphism UI design
- Component-based architecture

### Storage
- LocalStorage for user preferences
- IndexedDB for business data
- Automatic data synchronization
- Backup and restore functionality

### Security
- Client-side data encryption
- Secure authentication
- XSS protection
- Data sanitization

### Performance
- Service worker caching
- Lazy loading of components
- Efficient data structures
- Optimized rendering

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/saral-business-app.git
   ```

2. Navigate to the project directory:
   ```bash
   cd saral-business-app
   ```

3. Serve the files using any web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

4. Open your browser and navigate to `http://localhost:8000`

## Usage

1. **Registration**: Create an account with your email and password
2. **Business Setup**: Configure your business details and type
3. **Product Management**: Add your products with pricing and stock
4. **Sales**: Use the POS system for quick sales
5. **Analytics**: Monitor your business performance through the dashboard

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome for Android)

## Offline Capability

SARAL works offline thanks to its service worker implementation:
- Data is stored locally
- All functionality available without internet
- Automatic sync when connection is restored

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.

## Acknowledgments

- Designed for Indian small business owners
- Built with modern web technologies
- Optimized for performance and usability
- Fully responsive for all device sizes