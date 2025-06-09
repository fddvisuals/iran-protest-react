import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="morphic-footer w-full h-[250px] mt-[68px] flex justify-around items-center relative border-t border-white/20">
      <div className="z-2 w-[33%] relative">
        <img src="/images/footer-logo.png" alt="FDD Logo" className="filter invert mb-[10px]" />
        <p className="text-white/70 font-sans">© 2023 Foundation for Defense of Democracies</p>
      </div>
      
      <div className="z-2 w-[33%] flex flex-col gap-[15px] justify-center items-end relative">
        <a href="https://www.fdd.org" target="_blank" rel="noopener noreferrer" className="morphic-button-secondary px-4 py-2 font-sans font-semibold">
          Visit FDD.org
        </a>
        
        <div className="flex gap-4">
          <a href="https://twitter.com/fdd" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors duration-200 morphic-social-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
            </svg>
          </a>
          <a href="https://www.facebook.com/followFDD" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors duration-200 morphic-social-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
            </svg>
          </a>
        </div>
      </div>
      
      <div className="opacity-5 object-cover w-full max-h-full absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
    </footer>
  );
};

export default Footer;
