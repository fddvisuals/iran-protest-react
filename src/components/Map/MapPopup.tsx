import React from 'react';
import { ProtestData } from '../../utils/dataFetching';
import { getModifiedUrl } from '../../utils/dataFetching';

interface MapPopupProps {
  data: ProtestData;
}

const MapPopup: React.FC<MapPopupProps> = ({ data }) => {
  return (
    <div className="popup max-w-md">
      <div className="flex items-center space-x-2 mb-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 3H21C21.2652 3 21.5196 3.10536 21.7071 3.29289C21.8946 3.48043 22 3.73478 22 4V20C22 20.2652 21.8946 20.5196 21.7071 20.7071C21.5196 20.8946 21.2652 21 21 21H3C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20V4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3H7V1H9V3H15V1H17V3ZM4 9V19H20V9H4ZM6 11H8V13H6V11ZM11 11H13V13H11V11ZM16 11H18V13H16V11Z" fill="currentColor" />
        </svg>
        <div className="text-sm">{data.Date}</div>
      </div>
      
      <div className="flex items-center space-x-2 mb-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.364 17.3639L12 23.7279L5.636 17.3639C4.37734 16.1052 3.52019 14.5016 3.17293 12.7558C2.82567 11.0099 3.00391 9.20035 3.6851 7.55582C4.36629 5.91129 5.51984 4.50569 6.99988 3.51677C8.47992 2.52784 10.22 2 12 2C13.78 2 15.5201 2.52784 17.0001 3.51677C18.4802 4.50569 19.6337 5.91129 20.3149 7.55582C20.9961 9.20035 21.1743 11.0099 20.8271 12.7558C20.4798 14.5016 19.6227 16.1052 18.364 17.3639V17.3639ZM12 12.9999C12.5304 12.9999 13.0391 12.7892 13.4142 12.4141C13.7893 12.0391 14 11.5304 14 10.9999C14 10.4695 13.7893 9.96078 13.4142 9.58571C13.0391 9.21064 12.5304 8.99992 12 8.99992C11.4696 8.99992 10.9609 9.21064 10.5858 9.58571C10.2107 9.96078 10 10.4695 10 10.9999C10 11.5304 10.2107 12.0391 10.5858 12.4141C10.9609 12.7892 11.4696 12.9999 12 12.9999Z" fill="currentColor" />
        </svg>
        <div className="text-sm">
          <b className="underline">{data.City_Village}</b>{' '}
          <span className="underline">{data.County}</span>{' '}
          <span className="underline">{data.Province}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-3">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 21.9999C1 19.8782 1.84285 17.8434 3.34315 16.3431C4.84344 14.8428 6.87827 13.9999 9 13.9999C11.1217 13.9999 13.1566 14.8428 14.6569 16.3431C16.1571 17.8434 17 19.8782 17 21.9999H1ZM9 12.9999C5.685 12.9999 3 10.3149 3 6.99994C3 3.68494 5.685 0.999936 9 0.999936C12.315 0.999936 15 3.68494 15 6.99994C15 10.3149 12.315 12.9999 9 12.9999ZM18.246 3.18394C18.7454 4.39409 19.0016 5.69077 19 6.99994C19.0016 8.3091 18.7454 9.60578 18.246 10.8159L16.569 9.59593C16.8552 8.76037 17.0008 7.88314 17 6.99994C17.0011 6.11678 16.8558 5.23956 16.57 4.40394L18.246 3.18394V3.18394ZM21.548 0.783936C22.5062 2.71576 23.0032 4.84353 23 6.99994C23 9.23294 22.477 11.3439 21.548 13.2159L19.903 12.0199C20.6282 10.4459 21.0025 8.733 21 6.99994C21 5.20794 20.607 3.50694 19.903 1.97994L21.548 0.783936V0.783936Z" fill="currentColor" />
        </svg>
        <div className="text-sm">{data.Estimated_Size}</div>
      </div>
      
      <div className="mb-4 text-sm">{data.Description}</div>
      
      {(data.Injured || data.Arrested || data.Killed) && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {data.Injured && (
            <div className="bg-yellow-100 p-2 rounded">
              <div className="text-xs font-medium">Injured</div>
              <div className="text-sm font-bold">{data.Injured}</div>
            </div>
          )}
          
          {data.Arrested && (
            <div className="bg-blue-100 p-2 rounded">
              <div className="text-xs font-medium">Arrested</div>
              <div className="text-sm font-bold">{data.Arrested}</div>
            </div>
          )}
          
          {data.Killed && (
            <div className="bg-red-100 p-2 rounded">
              <div className="text-xs font-medium">Killed</div>
              <div className="text-sm font-bold">{data.Killed}</div>
            </div>
          )}
        </div>
      )}
      
      {data.Link && (
        <div className="flex justify-center">
          <a 
            href={data.Link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            <span>View Source</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6V8H5V19H16V14H18V20C18 20.2652 17.8946 20.5196 17.7071 20.7071C17.5196 20.8946 17.2652 21 17 21H4C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V7C3 6.73478 3.10536 6.48043 3.29289 6.29289C3.48043 6.10536 3.73478 6 4 6H10ZM21 3V12L17.206 8.207L11.207 14.207L9.793 12.793L15.792 6.793L12 3H21Z" fill="currentColor" />
            </svg>
          </a>
        </div>
      )}
      
      {data.MediaURL && (
        <div className="mt-4">
          <video 
            width="100%" 
            height="auto" 
            autoPlay 
            muted 
            controls
            className="rounded"
          >
            <source 
              src={`https://fdd.box.com/shared/static/${getModifiedUrl(data.MediaURL)}.mp4`} 
              type="video/mp4" 
            />
          </video>
        </div>
      )}
    </div>
  );
};

export default MapPopup;
