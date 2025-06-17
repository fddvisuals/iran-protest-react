import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ProtestData, getProtestCountByTimeFilter, getModifiedUrl } from '../utils/dataFetching';
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
  
  // Video popup state
  const [selectedVideo, setSelectedVideo] = useState<ProtestData | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mapRef = useRef<MapRef>(null);
  
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

  const getLocation = (video: ProtestData) => {
    const parts = [video.City_Village, video.County, video.Province].filter(Boolean);
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

  return (
    <>
      <Header />
      
      <div className="pt-[152px]">
        {/* Full width image with fade effect - starts right after header */}
        <div className="w-full relative mb-8 -mt-[152px]">
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
        
        <div className="flex flex-col items-center justify-center max-w-[800px] mx-auto gap-8">
          {/* Title and byline outside the box */}
          <div className="text-center">
            <h1 className="font-heading font-black leading-[40px] lg:leading-[50px] m-0 mb-8">
              <span className="text-[#00558c] text-[42px] lg:text-[56px] block mb-1">
                MAPPING PROTESTS
              </span>
              <span className="text-[#00558c] text-[42px] lg:text-[56px] block">
                IN IRAN
              </span>
            </h1>
            
            {/* Yellow accent divider */}
            <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
            
            <p className="font-sans font-bold leading-[30px]">
              <span className="text-[#00558c] text-[20px] lg:text-[25px]">
                Mark Dubowitz
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center max-w-[1200px] mx-auto mt-8 px-4 gap-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-3 px-8 py-4 bg-white rounded-2xl shadow-lg">
              <div className="w-3 h-3 bg-[#00558c] rounded-full"></div>
              <h1 className="font-sans text-[28px] leading-[32px] font-bold text-text-primary">
                <span className="text-[#00558c] font-black text-[32px]">
                  {displayCount}
                </span>
                {' '}protest{displayCount !== 1 ? 's' : ''} {displayTimeframe}
              </h1>
            </div>
          </div>
          
          <p className="w-full max-w-[800px] mx-auto text-center font-sans text-[16px] leading-[24px] text-text-primary/90 px-4">
            The Iranian regime continues to face widespread protests across the country. This interactive map shows the locations and details of recent protests, with video evidence where available.
          </p>
          
          <HorizontalVideoGrid />
        </div>
      </div>
      
      <TimeFilter />
      
      <div className="w-full max-w-[1200px] mx-auto px-4">
        {/* Map and List Side by Side */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
            {/* Protest List Section - 40% */}
            <div className="w-full lg:w-2/5 relative z-10">
              <ProtestList onVideoClick={handleVideoClick} />
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
