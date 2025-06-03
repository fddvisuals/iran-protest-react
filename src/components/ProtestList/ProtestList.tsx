import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProtestData } from '../../utils/dataFetching';

const ProtestList: React.FC = () => {
  const { filteredMapData, loading, setSelectedFeature } = useAppContext();
  
  if (loading) {
    return (
      <div className="w-full h-[500px] lg:h-[500px] rounded-lg">
        <h1 className="text-gray-700 text-left text-2xl font-bold mb-4">Recent Protests</h1>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse h-16 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }
  
  const recentProtests = [...filteredMapData]
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
    .slice(0, 50);
  
  const handleProtestClick = (protest: ProtestData) => {
    setSelectedFeature(protest);
  };
  
  return (
    <div className="w-full h-[500px] lg:h-[500px] rounded-lg">
      <h1 className="text-gray-700 text-left text-xl lg:text-2xl font-bold mb-4">Recent Protests</h1>
      <div className="space-y-3 overflow-y-auto h-[calc(500px-60px)] pr-2">
        {recentProtests.map((protest, index) => (
          <button
            key={index}
            onClick={() => handleProtestClick(protest)}
            className="w-full bg-main text-white p-3 lg:p-4 rounded-md border-b-2 border-gray-500 hover:bg-red-700 transition-colors flex flex-col items-start text-left group"
          >
            <div className="flex justify-between w-full items-start">
              <div className="flex-1 min-w-0">
                <div className="text-white">
                  <p className="uppercase text-sm lg:text-base font-bold truncate">
                    {protest.County}
                    <br />
                    <span className="text-xs lg:text-sm font-normal">{protest.Province}</span>
                  </p>
                </div>
              </div>
              
              {protest.MediaURL && (
                <div className="text-white flex items-center ml-2 flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM10.622 8.415C10.5618 8.37485 10.4919 8.35177 10.4196 8.34822C10.3473 8.34467 10.2755 8.36079 10.2116 8.39486C10.1478 8.42893 10.0944 8.47967 10.0572 8.54168C10.0199 8.60369 10.0001 8.67465 10 8.747V15.253C10.0001 15.3253 10.0199 15.3963 10.0572 15.4583C10.0944 15.5203 10.1478 15.5711 10.2116 15.6051C10.2755 15.6392 10.3473 15.6553 10.4196 15.6518C10.4919 15.6482 10.5618 15.6252 10.622 15.585L15.501 12.333C15.5559 12.2965 15.6009 12.247 15.632 12.1889C15.6631 12.1308 15.6794 12.0659 15.6794 12C15.6794 11.9341 15.6631 11.8692 15.632 11.8111C15.6009 11.753 15.5559 11.7035 15.501 11.667L10.621 8.415H10.622Z" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex flex-col mt-2 w-full space-y-1">
              <div className="flex items-center text-white text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 flex-shrink-0">
                  <path d="M17 3H21C21.2652 3 21.5196 3.10536 21.7071 3.29289C21.8946 3.48043 22 3.73478 22 4V20C22 20.2652 21.8946 20.5196 21.7071 20.7071C21.5196 20.8946 21.2652 21 21 21H3C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20V4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3H7V1H9V3H15V1H17V3ZM4 9V19H20V9H4ZM6 11H8V13H6V11ZM11 11H13V13H11V11ZM16 11H18V13H16V11Z" fill="currentColor" />
                </svg>
                <span className="truncate">{protest.Date}</span>
              </div>
              
              <div className="flex items-center text-white text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 flex-shrink-0">
                  <path d="M1 21.9999C1 19.8782 1.84285 17.8434 3.34315 16.3431C4.84344 14.8428 6.87827 13.9999 9 13.9999C11.1217 13.9999 13.1566 14.8428 14.6569 16.3431C16.1571 17.8434 17 19.8782 17 21.9999H1ZM9 12.9999C5.685 12.9999 3 10.3149 3 6.99994C3 3.68494 5.685 0.999936 9 0.999936C12.315 0.999936 15 3.68494 15 6.99994C15 10.3149 12.315 12.9999 9 12.9999ZM18.246 3.18394C18.7454 4.39409 19.0016 5.69077 19 6.99994C19.0016 8.3091 18.7454 9.60578 18.246 10.8159L16.569 9.59593C16.8552 8.76037 17.0008 7.88314 17 6.99994C17.0011 6.11678 16.8558 5.23956 16.57 4.40394L18.246 3.18394V3.18394ZM21.548 0.783936C22.5062 2.71576 23.0032 4.84353 23 6.99994C23 9.23294 22.477 11.3439 21.548 13.2159L19.903 12.0199C20.6282 10.4459 21.0025 8.733 21 6.99994C21 5.20794 20.607 3.50694 19.903 1.97994L21.548 0.783936V0.783936Z" fill="currentColor" />
                </svg>
                <span className="truncate">{protest.Estimated_Size}</span>
              </div>
            </div>
            
            <p className="text-white text-xs mt-2 line-clamp-2 text-left w-full">{protest.Description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProtestList;
