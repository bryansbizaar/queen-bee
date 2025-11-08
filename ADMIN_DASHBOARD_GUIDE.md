# Queen Bee Candles - Admin Dashboard Guide

## 🎯 Overview

The Admin Dashboard is a secure, web-based interface for managing your Queen Bee Candles e-commerce store. You can manage products, inventory, orders, and more - all from a user-friendly dashboard accessible from any device.

## 🔐 Access & Security

### Login Details
- **URL:** `https://queen-bee.fly.dev/admin/login` (Production)
- **Local:** `http://localhost:5173/admin/login` (Development)
- **Password:** Set in `server/.env` as `ADMIN_PASSWORD=admin123`

**⚠️ IMPORTANT:** Change the default password before deploying to production!

### How It Works
The admin dashboard uses simple password-based authentication:
- Password is stored in server environment variables
- Token is stored in browser localStorage after login
- All API requests include the password as a Bearer token
- Automatic logout on authentication errors

### Changing the Admin Password
1. **For Development (Local):**
   - Edit `server/.env`
   - Change `ADMIN_PASSWORD=your_new_password`
   - Restart the server

2. **For Production (Fly.io):**
   ```bash
   flyctl secrets set ADMIN_PASSWORD=your_new_password --app queen-bee
   flyctl apps restart queen-bee
   ```

## 📊 Dashboard Features

### 1. Product Management

#### View All Products
- See all 26 products in a sortable table
- View product images, prices, stock levels, and status
- Quick statistics:
  - Total Products
  - Active Products (visible in store)
  - Low Stock Alerts (<5 items)
  - Total Stock Value

#### Quick Stock Updates
- Edit stock quantities directly in the table
- Changes save immediately to the database
- Color-coded stock levels:
  - 🔴 **Red:** Out of stock (0 items)
  - 🟠 **Orange:** Low stock (<5 items)
  - 🟢 **Green:** Good stock (≥5 items)

#### Edit Products
Click the ✏️ (edit) icon to modify:
- **Basic Info:** Title, description, price
- **Inventory:** Stock quantity, category
- **Images:** Image filename (upload file to `/server/public/images/` first)
- **Dimensions:** Weight (kg), length/width/height (mm) for shipping calculations
- **Display:** Active status, featured status, display order
- **Visibility:** Active (shown in store) vs Inactive (hidden)

#### Add New Products
1. Click "**+ Add Product**" button
2. Fill in required fields (marked with *)
3. Upload product image to server first
4. Enter dimensions for accurate shipping quotes
5. Click "**Create Product**"

#### Deactivate Products
- Click 🗑️ (trash) icon to hide product from store
- Product remains in database but becomes invisible to customers
- Can be reactivated by editing the product

### 2. Order Management

#### View Orders
- See all customer orders in a table
- Filter by status: All, Pending, Processing, Shipped, Delivered, Cancelled
- View customer details and contact information
- Expandable order items list

#### Order Information Displayed
- **Order ID:** Unique identifier for tracking
- **Customer:** Name (or "Guest" if not provided)
- **Email:** Customer contact email
- **Items:** Expandable list of products ordered
- **Total:** Order total in NZD
- **Status:** Current order status
- **Date:** When order was placed

#### Update Order Status
1. Find the order in the table
2. Click the status dropdown
3. Select new status:
   - **Pending:** Order received, payment confirmed
   - **Processing:** Order being prepared
   - **Shipped:** Order sent to customer
   - **Delivered:** Order received by customer
   - **Cancelled:** Order cancelled
4. Status updates automatically

#### Order Statistics
- **Total Orders:** All orders ever received
- **Pending:** Orders awaiting processing
- **Processing:** Orders being prepared
- **Total Revenue:** Sum of all order values

### 3. Navigation

- **🐝 Queen Bee Admin Dashboard** (header): Always visible
- **View Store:** Link to public store front
- **Products Tab:** Product inventory management
- **Orders Tab:** Order processing and tracking
- **Logout:** Clear session and return to login

## 🚀 Getting Started

### First Time Setup

1. **Access the Dashboard**
   - Navigate to `/admin/login`
   - Enter admin password: `admin123`
   - Click "Login"

2. **Verify Product Data**
   - Click "Products" tab
   - Verify all 26 products are listed
   - Check stock levels are accurate
   - Verify images are loading correctly

3. **Test Stock Update**
   - Find any product
   - Change stock quantity
   - Click ✓ (checkmark) to save
   - Refresh page to verify change persisted

4. **Check Orders**
   - Click "Orders" tab
   - Verify orders are displaying
   - Test status updates
   - Expand order items to see details

### Daily Operations

#### Managing Inventory
1. Log into admin dashboard
2. Scan for low stock warnings (red/orange numbers)
3. Update stock quantities as needed
4. Deactivate out-of-stock items if desired

#### Processing Orders
1. Navigate to Orders tab
2. Filter by "Pending" status
3. Review order details
4. Update status to "Processing"
5. Prepare/ship order
6. Update status to "Shipped"
7. Mark as "Delivered" when confirmed

#### Adding New Products
1. Prepare product image (recommended: square, 800x800px, JPG/PNG)
2. Upload to `/server/public/images/` on server
3. Click "+ Add Product" in dashboard
4. Fill in all details:
   - Title, description, price
   - Image filename (e.g., `new-candle.jpg`)
   - Category, stock quantity
   - Dimensions for shipping
5. Click "Create Product"
6. Verify product appears in store

## 📱 Mobile Support

The admin dashboard is fully responsive and works on:
- 💻 Desktop computers
- 📱 Smartphones
- 🖥️ Tablets

Tables scroll horizontally on smaller screens to maintain usability.

## 🐛 Troubleshooting

### Can't Login
- **Issue:** "Invalid admin password"
- **Solution:** Verify password in `server/.env` or Fly.io secrets
- **Check:** `flyctl secrets list --app queen-bee`

### Products Not Loading
- **Issue:** "Failed to load products"
- **Solution:** Check database connection
- **Verify:** Server is running and DATABASE_URL is set

### Stock Changes Not Saving
- **Issue:** Stock updates don't persist
- **Solution:** Check browser console for errors
- **Verify:** Authentication token is valid (try logging out/in)

### Images Not Displaying
- **Issue:** Broken image icons
- **Solution:** Verify image files exist in `/server/public/images/`
- **Check:** Image filename matches exactly (case-sensitive)

### Orders Not Showing
- **Issue:** Order list is empty
- **Solution:** Verify orders exist in database
- **Check:** Run SQL: `SELECT * FROM orders;`

## 🔧 Technical Details

### API Endpoints

All admin endpoints require Bearer token authentication:

**Products:**
- `GET /api/admin/products` - List all products
- `GET /api/admin/products/:id` - Get single product
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `PATCH /api/admin/products/:id/stock` - Update stock only
- `DELETE /api/admin/products/:id` - Deactivate product (soft delete)

**Orders:**
- `GET /api/admin/orders` - List all orders (with optional status filter)
- `GET /api/admin/orders/:id` - Get single order with items
- `PATCH /api/admin/orders/:id/status` - Update order status

### Database Tables

**Products Table:**
```sql
- id: Primary key
- title: Product name
- description: Product description
- price: Price in cents (NZD)
- image: Image filename
- category: Product category
- stock_quantity: Current inventory
- is_active: Visibility in store
- is_featured: Featured product flag
- display_order: Sort order
- weight_kg: Weight for shipping
- length_mm, width_mm, height_mm: Dimensions
- created_at, updated_at: Timestamps
```

**Orders Table:**
```sql
- id: Primary key
- order_id: Friendly order ID
- customer_id: Foreign key to customers
- customer_email: Email for contact
- total_amount: Order total in cents
- status: Order status
- shipping_address: JSON address data
- created_at, updated_at: Timestamps
```

### File Structure

```
client/src/
├── components/
│   ├── AdminDashboard.jsx    # Main dashboard
│   ├── AdminLogin.jsx         # Login page
│   ├── AdminOrders.jsx        # Order management
│   ├── ProductForm.jsx        # Add/edit products
│   └── ProductTable.jsx       # Product listing
├── context/
│   └── AdminContext.jsx       # Auth state management
├── services/
│   └── adminApi.js           # API client
└── styles/
    ├── AdminDashboard.css
    ├── AdminLogin.css
    ├── AdminOrders.css
    ├── ProductForm.css
    └── ProductTable.css

server/
├── controllers/
│   └── admin.controller.js   # Admin logic
├── routes/
│   └── admin.routes.js       # Admin endpoints
└── middleware/
    └── (auth handled in routes)
```

## 🎨 Customization

### Branding
The dashboard uses Queen Bee's signature gold color scheme:
- Primary: `#ffd700` (gold)
- Hover: `#ffed4e` (light gold)
- Background: `#f5f5f5` (light gray)

To customize:
1. Edit CSS files in `client/src/styles/`
2. Update colors in AdminDashboard.css
3. Rebuild: `cd client && npm run build`

### Adding Features
To add new admin features:
1. Create controller in `server/controllers/admin.controller.js`
2. Add route in `server/routes/admin.routes.js`
3. Create React component in `client/src/components/`
4. Add to `client/src/App.jsx` routing

## 📞 Support

If you encounter issues:
1. Check server logs: `flyctl logs --app queen-bee`
2. Check browser console for errors
3. Verify database connection
4. Review this guide's troubleshooting section

## 🔒 Security Best Practices

1. **Change default password immediately**
2. **Use strong, unique passwords**
3. **Log out when finished**
4. **Don't share admin credentials**
5. **Access only from secure networks**
6. **Keep server software updated**

## 📝 Quick Reference

| Action | Steps |
|--------|-------|
| Login | `/admin/login` → Enter password → Login |
| Update Stock | Products → Find item → Change number → Click ✓ |
| Add Product | Products → + Add Product → Fill form → Create |
| Edit Product | Products → Click ✏️ → Edit → Update |
| Process Order | Orders → Find order → Change status dropdown |
| Filter Orders | Orders → Select status from dropdown |
| Logout | Click "Logout" button in header |

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Contact:** Queen Bee Candles Support
