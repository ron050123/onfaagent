import React, { useState } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Định nghĩa hàm onToggleMenu
  const onToggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <header>
      {/* Header content */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="logo">
          CFONFA
        </div>

        {/* Menu Items */}
        <div className="flex items-center space-x-4">
          <button className="btn-register">Đăng ký</button>
          <button className="search-icon">🔍</button>
          
          {/* Hamburger Menu Button */}
          <button 
            onClick={onToggleMenu}
            className="menu-toggle"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu (nếu cần) */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {/* Menu items */}
        </div>
      )}
    </header>
  );
}

export default Header;

