import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AdminProvider } from "./context/AdminContext";
import Header from "./components/Header";
import CardList from "./components/CardList";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import About from "./components/About";
import Contact from "./components/Contact";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentFailure from "./components/PaymentFailure";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminOrders from "./components/AdminOrders";
import ProductForm from "./components/ProductForm";


function App() {
  return (
    <Router>
      <AdminProvider>
        <CartProvider>
          <Routes>
            {/* Admin Routes (no header) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/products/:id" element={<ProductForm />} />

            {/* Public Routes (with header) */}
            <Route
              path="/*"
              element={
                <div className="app">
                  <a href="#main-content" className="skip-link">
                    Skip to main content
                  </a>
                  <Header />
                  <main id="main-content" className="main-content" role="main">
                    <Routes>
                      <Route path="/" element={<CardList />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/payment/success" element={<PaymentSuccess />} />
                      <Route path="/payment/failure" element={<PaymentFailure />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Routes>
        </CartProvider>
      </AdminProvider>
    </Router>
  );
}

export default App;
