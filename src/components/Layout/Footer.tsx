import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#00558c] text-white py-12 mt-[68px] relative overflow-hidden">
      {/* Blue background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00558c] to-[#004778]"></div>
      
      <div className="relative z-10 max-w-[1200px] mx-auto px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left side - Logo and Mission */}
          <div className="flex-1 lg:max-w-2xl">
            <img 
              src={`${import.meta.env.BASE_URL}images/Visuals_Logo_Temporary_v01.svg`} 
              alt="FDD Logo" 
              className="h-12 w-auto mb-6 filter brightness-0 invert" 
            />
            
            <p className="text-white/90 leading-relaxed mb-6 font-sans text-sm">
              FDD conducts in-depth research, produces accurate and timely analyses, identifies illicit activities, and provides policy options – all with the aim of strengthening U.S. national security and reducing or eliminating threats posed by adversaries of the United States and other free nations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <p className="text-white/70 font-sans text-sm">
                2025 Foundation for Defense of Democracies — <a href="https://www.fdd.org/privacy-policy/" className="hover:text-white transition-colors underline">Privacy Policy</a>
              </p>
            </div>
          </div>
          
          {/* Right side - Buttons and Social Media */}
          <div className="flex flex-col gap-6 lg:items-end">
            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <a 
                href="https://www.fdd.org/category/analysis/visuals/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-transparent border border-white/60 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 hover:border-white transition-all duration-200 text-center"
              >
                FDD Visuals
              </a>
              <a 
                href="https://www.fdd.org/media/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-transparent border border-white/60 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 hover:border-white transition-all duration-200 text-center"
              >
                Press Inquiries
              </a>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex gap-4 justify-center lg:justify-end">
              {/* X (Twitter) */}
              <a 
                href="https://twitter.com/fdd" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                aria-label="Follow FDD on X"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/followFDD" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                aria-label="Follow FDD on Facebook"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>
              
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/fdd_org/?" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                aria-label="Follow FDD on Instagram"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              {/* YouTube */}
              <a 
                href="https://www.youtube.com/c/FoundationforDefenseofDemocracies-FDD/videos?view_as=subscriber" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                aria-label="Follow FDD on YouTube"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/company/foundation-for-defense-of-democracies/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                aria-label="Follow FDD on LinkedIn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
