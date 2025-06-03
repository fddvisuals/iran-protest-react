import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  useEffect(() => {
    setLastUpdated('Jan 3, 2023');
  }, []);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-main border-b-2 border-[#f1e8b8] flex justify-between items-center h-[75px]">
      <a href="https://www.fdd.org/category/analysis/visuals/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-[300px] h-full">
        <img src="/images/Visuals_Logo_Temporary_v01.svg" alt="FDD Logo" className="max-w-[70%] ml-[30px]" />
      </a>
      
      <div className="absolute w-full h-[9px] mt-[81.5px] bg-[#68686880]"></div>
      
      <div className="flex items-center justify-center w-[800px] h-full -translate-y-[70px]">
        <div className="text-black opacity-80 text-center capitalize w-[80%] text-[1.2em] font-bold leading-[25px]">
          What steps must Iran take to construct nuclear weapons?
        </div>
      </div>
      
      <div className="absolute right-[4.5%] flex gap-[11px]">
        <a href="documents/fdd-infographic-what-steps-must-iran-take-to-construct-nuclear-weapons.pdf" className="flex items-center justify-center border border-black hover:bg-[#c2c2c2] transition-all duration-200">
          <span className="uppercase text-[12px] font-bold px-[25px] py-[5px]">Download</span>
        </a>
      </div>
      
      <div className="flex items-center justify-center bg-main border border-[#949494] rounded-lg w-[290px] mr-[11px] p-[9px] text-white italic">
        <div className="mr-[10px] pt-[3px]">
          {/* Animation placeholder */}
        </div>
        <div className="uppercase font-sans text-[1.5vh] font-normal leading-[1.5vh]">Last updated </div>
        <div className="text-[#80eaf7] text-left uppercase rounded-[5px] font-sans text-[1.5vh] font-bold leading-[1.5vh]">{lastUpdated}</div>
      </div>
    </header>
  );
};

export default Header;
