"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      {/* Blocking inline script to apply dark theme before DOM paint */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var savedTheme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', savedTheme);
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `,
        }}
      />
      <div className="app">
        <Header />
        {children}
        <Footer />
      </div>
    </>
  );
}