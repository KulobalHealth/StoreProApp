# Awosel OS - Point of Sale System

A comprehensive Point of Sale (POS) system built with React.js and Tailwind CSS for retail stores, supermarkets, and pharmacies.

## Features

### Core Features
- **Sales & Checkout**: Fast product lookup, barcode scanning, cart management, discounts, and multiple payment methods
- **Inventory Management**: Product management, stock tracking, low stock alerts, category management
- **Reporting & Analytics**: Sales reports, profit analysis, top products, category breakdowns
- **Customer Management (CRM)**: Customer database, purchase history, loyalty points tracking
- **Staff Management**: User roles (Admin, Manager, Cashier), permissions, sales tracking
- **Settings**: Store configuration, receipt customization, notifications, security settings

### Payment Methods
- Cash
- Card
- Mobile Money
- Split Payments

### Dashboard
- Real-time KPIs
- Sales charts and trends
- Top selling products
- Low stock alerts

## Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Vite** - Build tool

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
Awosel OS/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with sidebar navigation
│   ├── pages/
│   │   ├── Dashboard.jsx       # Analytics dashboard
│   │   ├── POS.jsx             # Point of Sale / Checkout
│   │   ├── Inventory.jsx       # Inventory management
│   │   ├── Reports.jsx         # Sales reports and analytics
│   │   ├── Customers.jsx       # Customer management
│   │   ├── Staff.jsx           # Staff and user management
│   │   └── Settings.jsx        # System settings
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

## Usage

### POS / Checkout
1. Search for products by name or scan barcode
2. Click products to add to cart
3. Adjust quantities or remove items
4. Apply discounts (percentage or fixed amount)
5. Select payment method and process payment

### Inventory Management
- Add, edit, or delete products
- Track stock levels
- Set minimum stock thresholds
- Import/export product data
- View low stock alerts

### Reports
- View daily, weekly, monthly sales
- Analyze profit margins
- Track top selling products
- Export reports to PDF/Excel

## Future Enhancements (Phase 2+)

- Multi-store/branch management
- Stock transfer between stores
- Mobile Money API integration
- Advanced loyalty program
- Prescription management (Pharmacy mode)
- Batch and expiry tracking
- Accounting system integration
- Supplier management
- Advanced reporting and analytics

## License

MIT

