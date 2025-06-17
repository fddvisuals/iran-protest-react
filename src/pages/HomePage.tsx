import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ProtestData, getProtestCountByTimeFilter, getModifiedUrl, fetchStatisticsData, StatisticsData } from '../utils/dataFetching';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import HorizontalVideoGrid from '../components/VideoGrid/HorizontalVideoGrid';
import ProtestMap from '../components/Map/ProtestMap';
import ProtestList from '../components/ProtestList/ProtestList';
import TimeFilter from '../components/TimeFilter/TimeFilter';
import ProtestCharts from '../components/Charts/ProtestCharts';
import { X, Play, Pause, Volume2, VolumeX, Calendar, MapPin, Users } from 'lucide-react';
import Map, { Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
import { csvToGeoJSON } from '../utils/geoJsonUtils';

const MAPBOX_TOKEN = "pk.eyJ1IjoiZmRkdmlzdWFscyIsImEiOiJjbGZyODY1dncwMWNlM3pvdTNxNjF4dG1rIn0.wX4YYvWhm5W-5t8y5pp95w";

const HomePage: React.FC = () => {
  const { mapData, loading } = useAppContext();
  
  // Statistics state
  const [statistics, setStatistics] = useState<StatisticsData>({ 
    minorsKilled: 0, 
    totalKilled: 0, 
    totalArrested: 0, 
    lastUpdated: ''
  });
  
  // Video popup state
  const [selectedVideo, setSelectedVideo] = useState<ProtestData | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mapRef = useRef<MapRef>(null);
  
  // Protest details modal state
  const [selectedProtest, setSelectedProtest] = useState<ProtestData | null>(null);
  const [showProtestModal, setShowProtestModal] = useState(false);
  const protestMapRef = useRef<MapRef>(null);
  
  // Fetch statistics data
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const data = await fetchStatisticsData();
        setStatistics(data);
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    };
    
    loadStatistics();
  }, []);
  
  // Always show weekly protest count in the top section (not affected by filter selection)
  const weeklyProtestCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'last-week');
  const monthlyProtestCount = loading ? 0 : getProtestCountByTimeFilter(mapData, 'last-month');
  
  // If weekly count is below 35, show monthly count instead
  const displayCount = weeklyProtestCount < 35 ? monthlyProtestCount : weeklyProtestCount;
  const displayTimeframe = weeklyProtestCount < 35 ? 'within the last 30 days' : 'this week';

  // Video popup handlers
  const handleVideoClick = (video: ProtestData) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
    setVideoPlaying(false);
    setVideoMuted(true);
  };

  const closeModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
    setVideoPlaying(false);
    setVideoMuted(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };
  
  // Protest details modal handlers
  const handleProtestDetailsClick = (protest: ProtestData) => {
    setSelectedProtest(protest);
    setShowProtestModal(true);
  };

  const closeProtestModal = () => {
    setShowProtestModal(false);
    setSelectedProtest(null);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoMuted;
      setVideoMuted(!videoMuted);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLocation = (data: ProtestData) => {
    const parts = [data.City_Village, data.County, data.Province].filter(Boolean);
    return parts.join(', ');
  };

  // Map layer styles
  const pointLayer: any = {
    id: 'protest-point',
    type: 'circle',
    paint: {
      'circle-color': '#ef4444',
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.8
    }
  };

  const getMapData = () => {
    if (!selectedVideo || !selectedVideo.Longitude || !selectedVideo.Latitude) return null;
    
    return csvToGeoJSON([selectedVideo]);
  };
  
  const getProtestMapData = () => {
    if (!selectedProtest || !selectedProtest.Longitude || !selectedProtest.Latitude) return null;
    
    return csvToGeoJSON([selectedProtest]);
  };

  return (
    <>
      <Header />
      
      <div className="pt-[60px] sm:pt-[75px] lg:pt-[152px]">
        {/* Full width image with fade effect - starts right after header */}
        <div className="w-full relative mb-4 sm:mb-8 -mt-[60px] sm:-mt-[75px] lg:-mt-[152px]">
          <img 
            src={`${import.meta.env.BASE_URL}images/Visual_IranMap2.0_FeatureImage_v02.jpg`}
            alt="Iran Map Visual" 
            className="w-full h-auto object-cover"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)'
            }}
          />
        </div>
        
        <div className="flex flex-col items-center justify-center max-w-[800px] mx-auto gap-4 sm:gap-8">
          {/* Title and byline outside the box */}
          <div className="text-center px-2 sm:px-4">
            <h1 className="font-heading font-black leading-[28px] sm:leading-[40px] lg:leading-[50px] m-0 mb-4 sm:mb-8">
              <span className="text-[#00558c] text-[28px] sm:text-[42px] lg:text-[56px] block mb-1">
                MAPPING PROTESTS
              </span>
              <span className="text-[#00558c] text-[28px] sm:text-[42px] lg:text-[56px] block">
                IN IRAN
              </span>
            </h1>
            
            {/* Yellow accent divider */}
            <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-4 sm:mb-6 rounded-full"></div>
            
            <p className="font-sans font-bold leading-[24px] sm:leading-[30px]">
              <span className="text-[#00558c] text-[16px] sm:text-[20px] lg:text-[25px]">
                Mark Dubowitz
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center max-w-[1200px] mx-auto mt-4 sm:mt-8 px-2 sm:px-4 gap-4 sm:gap-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-8 py-3 sm:py-4 bg-white rounded-xl sm:rounded-2xl shadow-lg">
              <div className="w-2 sm:w-3 h-2 sm:h-3 bg-[#00558c] rounded-full live-counter-dot"></div>
              <h1 className="font-sans text-[20px] sm:text-[28px] leading-[24px] sm:leading-[32px] font-bold text-text-primary">
                <span className="text-[#00558c] font-black text-[24px] sm:text-[32px]">
                  {displayCount}
                </span>
                {' '}protest{displayCount !== 1 ? 's' : ''} {displayTimeframe}
              </h1>
            </div>
          </div>
          
          <p className="w-full max-w-[800px] mx-auto text-center font-sans text-[14px] sm:text-[16px] leading-[20px] sm:leading-[24px] text-text-primary/90 px-2 sm:px-4">
            The Iranian regime continues to face widespread protests across the country. This interactive map shows the locations and details of recent protests, with video evidence where available.
          </p>
          
          {/* Statistics Cards */}
          <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 mb-4 sm:mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 justify-items-center">
              {/* Minors Killed */}
              <div className="relative flex flex-col items-center space-y-2 sm:space-y-3 px-4 sm:px-6 py-4 sm:py-6 w-full"
                   style={{
                     borderRadius: '12px',
                     background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.90) 0%, rgba(185, 28, 28, 0.85) 50%, rgba(153, 27, 27, 0.90) 100%)',
                     boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4), 0 3px 10px rgba(0, 0, 0, 0.15)',
                     border: '1.5px solid rgba(239, 68, 68, 0.6)'
                   }}>
                {/* Warning indicator */}
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-red-800" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-sans text-[14px] sm:text-[18px] font-bold text-white text-center drop-shadow-lg">
                  Minors Killed
                </h4>
                <p className="text-white font-black text-[28px] sm:text-[36px] leading-none drop-shadow-lg">
                  {statistics.minorsKilled.toLocaleString()}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl pointer-events-none"></div>
              </div>

              {/* Total Killed */}
              <div className="relative flex flex-col items-center space-y-2 sm:space-y-3 px-4 sm:px-6 py-4 sm:py-6 w-full"
                   style={{
                     borderRadius: '12px',
                     background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.90) 0%, rgba(185, 28, 28, 0.85) 50%, rgba(153, 27, 27, 0.90) 100%)',
                     boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4), 0 3px 10px rgba(0, 0, 0, 0.15)',
                     border: '1.5px solid rgba(239, 68, 68, 0.6)'
                   }}>
                {/* Warning indicator */}
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-red-800" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-sans text-[14px] sm:text-[18px] font-bold text-white text-center drop-shadow-lg">
                  Protestors Killed
                </h4>
                <p className="text-white font-black text-[28px] sm:text-[36px] leading-none drop-shadow-lg">
                  {statistics.totalKilled.toLocaleString()}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
              </div>

              {/* Total Arrested */}
              <div className="relative flex flex-col items-center space-y-2 sm:space-y-3 px-4 sm:px-6 py-4 sm:py-6 w-full"
                   style={{
                     borderRadius: '12px',
                     background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.90) 0%, rgba(185, 28, 28, 0.85) 50%, rgba(153, 27, 27, 0.90) 100%)',
                     boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4), 0 3px 10px rgba(0, 0, 0, 0.15)',
                     border: '1.5px solid rgba(239, 68, 68, 0.6)'
                   }}>
                {/* Warning indicator */}
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-red-800" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-sans text-[14px] sm:text-[18px] font-bold text-white text-center drop-shadow-lg">
                  Protestors Arrested
                </h4>
                <p className="text-white font-black text-[28px] sm:text-[36px] leading-none drop-shadow-lg">
                  {statistics.totalArrested.toLocaleString()}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl pointer-events-none"></div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Video Grid - Full Width Container */}
      <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 mb-4 sm:mb-8">
        <HorizontalVideoGrid />
      </div>
      
      <TimeFilter />
      
      <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4">
        {/* Map and List Side by Side */}
        <div className="w-full flex flex-col lg:flex-row gap-3 sm:gap-6">
            {/* Protest List Section - 40% */}
            <div className="w-full lg:w-2/5 relative z-10">
              <ProtestList onVideoClick={handleVideoClick} onProtestDetailsClick={handleProtestDetailsClick} />
            </div>
            
            {/* Map Section - 60% */}
            <div className="w-full lg:w-3/5 relative z-0">
              <ProtestMap />
            </div>
          </div>
        </div>
      
      <ProtestCharts />
      
      {/* Credits Section */}
      <div className="w-full max-w-[1200px] mx-auto px-4 py-8 mt-16">
        <div className="w-16 h-0.5 bg-gray-600 mx-auto mb-6"></div>
        <div className="text-center space-y-2 text-base text-gray-800 italic">
          <p className="font-medium">Development and Design by <span className="font-bold">Pavak Patel</span></p>
          <p className="font-medium">Creative direction by <span className="font-bold">Daniel Ackerman</span></p>
        </div>
      </div>
      
      {/* Protest Details Modal */}
      {showProtestModal && selectedProtest && (
        <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/40 shadow-2xl relative z-[99999]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/30 bg-white/20 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-gray-800">Protest Details</h3>
              <button
                onClick={closeProtestModal}
                className="text-gray-600 hover:text-gray-800 text-2xl transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/30"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-white/5 backdrop-blur-sm">
              {/* Location */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#00558c]" />
                  Location
                </h4>
                <p className="text-gray-700 text-lg">{getLocation(selectedProtest)}</p>
              </div>
              
              {/* Date */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-[#00558c]" />
                  Date
                </h4>
                <p className="text-gray-700 text-lg">{formatDate(selectedProtest.Date)}</p>
              </div>
              
              {/* Crowd Size */}
              {selectedProtest.Estimated_Size && (
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-[#00558c]" />
                    Estimated Crowd Size
                  </h4>
                  <p className="text-gray-700 text-lg">{selectedProtest.Estimated_Size}</p>
                </div>
              )}
              
              {/* Description */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Description</h4>
                <p className="text-gray-700 leading-relaxed">{selectedProtest.Description}</p>
              </div>
              
              {/* Map */}
              {selectedProtest.Longitude && selectedProtest.Latitude && (
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Map Location</h4>
                  <div className="h-48 rounded-xl overflow-hidden border border-white/40 shadow-lg">
                    <Map
                      ref={protestMapRef}
                      mapboxAccessToken={MAPBOX_TOKEN}
                      mapStyle="mapbox://styles/fddvisuals/cmbv5dm4j01cb01s22yro54ii"
                      longitude={parseFloat(selectedProtest.Longitude)}
                      latitude={parseFloat(selectedProtest.Latitude)}
                      zoom={12}
                      interactive={true}
                    >
                      {getProtestMapData() && (
                        <Source
                          id="protest-location"
                          type="geojson"
                          data={getProtestMapData()!}
                        >
                          <Layer {...pointLayer} />
                        </Source>
                      )}
                      <NavigationControl position="top-right" />
                    </Map>
                  </div>
                </div>
              )}
              
              {/* Source */}
              {selectedProtest.Link && (
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Source</h4>
                  <a 
                    href={selectedProtest.Link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00558c] hover:text-[#004778] transition-colors font-medium underline"
                  >
                    {selectedProtest.Source || 'View Source'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/40 shadow-2xl relative z-[99999]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/30 bg-white/20 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-gray-800">Video Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800 text-2xl transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/30"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content - Portrait Video Left, Info Right */}
            <div className="flex flex-col lg:flex-row bg-white/10 backdrop-blur-sm">
              {/* Left Side - Video */}
              <div className="lg:w-1/2 p-6 flex flex-col items-center bg-white/5">
                <div className="w-full max-w-md relative bg-black/80 rounded-2xl overflow-hidden shadow-lg border border-white/20">
                  <video
                    ref={videoRef}
                    className="w-full h-auto aspect-[9/16] object-cover"
                    src={`https://fdd.box.com/shared/static/${getModifiedUrl(selectedVideo.MediaURL)}.mp4`}
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    onLoadedData={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = videoMuted;
                      }
                    }}
                  />
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg"
                    >
                      {videoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg"
                    >
                      {videoMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Information */}
              <div className="lg:w-1/2 p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-white/5 backdrop-blur-sm">
                {/* Location */}
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#00558c]" />
                    Location
                  </h4>
                  <p className="text-gray-700 text-lg">{getLocation(selectedVideo)}</p>
                </div>
                
                {/* Date */}
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-[#00558c]" />
                    Date
                  </h4>
                  <p className="text-gray-700 text-lg">{formatDate(selectedVideo.Date)}</p>
                </div>
                
                {/* Crowd Size */}
                {selectedVideo.Estimated_Size && (
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-[#00558c]" />
                      Estimated Crowd Size
                    </h4>
                    <p className="text-gray-700 text-lg">{selectedVideo.Estimated_Size}</p>
                  </div>
                )}
                
                {/* Description */}
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedVideo.Description}</p>
                </div>
                
                {/* Map */}
                {selectedVideo.Longitude && selectedVideo.Latitude && (
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Map Location</h4>
                    <div className="h-48 rounded-xl overflow-hidden border border-white/40 shadow-lg">
                      <Map
                        ref={mapRef}
                        mapboxAccessToken={MAPBOX_TOKEN}
                        mapStyle="mapbox://styles/fddvisuals/cmbv5dm4j01cb01s22yro54ii"
                        longitude={parseFloat(selectedVideo.Longitude)}
                        latitude={parseFloat(selectedVideo.Latitude)}
                        zoom={12}
                        interactive={true}
                      >
                        {getMapData() && (
                          <Source
                            id="protest-location"
                            type="geojson"
                            data={getMapData()!}
                          >
                            <Layer {...pointLayer} />
                          </Source>
                        )}
                        <NavigationControl position="top-right" />
                      </Map>
                    </div>
                  </div>
                )}
                
                {/* Source */}
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Source</h4>
                  <a 
                    href={selectedVideo.Link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00558c] hover:text-[#004778] transition-colors font-medium underline"
                  >
                    {selectedVideo.Source}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default HomePage;
