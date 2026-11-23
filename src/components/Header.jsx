"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { resetFilters } from "@/features/filters/filterSlice";
import { setPage } from "@/features/ui/uiSlice";

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    dispatch(resetFilters());
    dispatch(setPage(1));
    router.push(`/`);
  };

  const handleSearchClick = () => {
    // Target 'library' to scroll to the "YOUR LIBRARY" section & filter bar
    const libraryElement = document.getElementById("library") || document.getElementById("showcase");
    if (libraryElement) {
      const yOffset = -80;
      const y = libraryElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });

      const searchInput = libraryElement.querySelector(".search-input") || document.querySelector(".search-input");
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 350);
      }
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          
          {/* Left Side: Logo & Branding */}
          <div className="header-left">
            <a href="/" className="brand-link" onClick={handleLogoClick}>
              <div className="logo-badge">HC</div>
              <div className="brand-text">
                <span className="brand-title">HOCKEYCURVE</span>
                <span className="brand-subtitle">CREATIVE TEMPLATE GALLERY</span>
              </div>
            </a>
          </div>

          {/* Right Side: Actions */}
          <div className="header-right">
            
            {/* Search Icon */}
            <button
              type="button"
              onClick={handleSearchClick}
              className="header-action-btn"
              aria-label="Search templates"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-3.5-3.5" />
              </svg>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn"
            >
              {theme === "dark" ? (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
                    />
                  </svg>
                  <span>Light</span>
                </>
              ) : (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                  <span>Dark</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;