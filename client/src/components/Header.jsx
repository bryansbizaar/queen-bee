import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import CartIcon from "./CartIcon";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        navRef.current &&
        menuButtonRef.current &&
        !navRef.current.contains(event.target) &&
        !menuButtonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    // Add event listener when menu is open
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <div className="header-top">
          <div className="logo-wrapper">
            <Link to="/" aria-label="Queen Bee Candles - Go to homepage">
              <img src={logo} alt="Queen Bee Candles Logo" className="logo" />
            </Link>
          </div>

          <div className="header-title">
            <h1>Queen Bee Candles</h1>
            <p>Pure NZ Beeswax</p>
          </div>

          {/* Add the cart icon here for mobile view */}
          <div className="mobile-cart">
            <CartIcon />
          </div>

          <button
            ref={menuButtonRef}
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            <span className="menu-icon" aria-hidden="true"></span>
          </button>
        </div>

        <div className="nav-container">
          <nav 
            ref={navRef}
            className={`main-nav ${menuOpen ? "is-open" : ""}`}
            role="navigation"
            aria-label="Main navigation"
            id="main-navigation"
          >
            <ul role="list">
              <li>
                <Link to="/" onClick={closeMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={closeMenu}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={closeMenu}>
                  Contact
                </Link>
              </li>
              <li className="cart-nav-item">
                <CartIcon />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
