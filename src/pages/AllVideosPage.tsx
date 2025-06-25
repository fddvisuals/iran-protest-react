import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Play, Calendar, MapPin, Users, Eye, X, Volume2, VolumeX, Pause } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ProtestData } from '../utils/dataFetching';
import { getModifiedUrl } from '../utils/dataFetching';
import { setMobileVideoAttributes, loadVideoThumbnail } from '../utils/videoUtils';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Map, { Source, Layer, NavigationControl, MapRef } from 'react-map-gl';
import { csvToGeoJSON } from '../utils/geoJsonUtils';

const MAPBOX_TOKEN = "pk.eyJ1IjoiZmRkdmlzdWFscyIsImEiOiJjbGZyODY1dncwMWNlM3pvdTNxNjF4dG1rIn0.wX4YYvWhm5W-5t8y5pp95w";

const AllVideosPage: React.FC = () => {
  const { filteredVideoData, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'location' | 'size'>('date');
  const [filteredVideos, setFilteredVideos] = useState<ProtestData[]>([]);
  const [visibleVideos, setVisibleVideos] = useState<ProtestData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<ProtestData | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mapRef = useRef<MapRef>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  
  const videosPerPage = 20;
  const maxVideos = 500;

  useEffect(() => {
    if (!loading && filteredVideoData.length > 0) {
      // Take up to 500 videos
      let videos = filteredVideoData.slice(0, maxVideos);
      
      // Apply search filter
      if (searchTerm) {
        videos = videos.filter(video => 
          video.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.City_Village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.County?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.Province?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply sorting
      videos.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.Date).getTime() - new Date(a.Date).getTime();
          case 'location':
            return (a.Province || '').localeCompare(b.Province || '');
          case 'size':
            const sizeA = parseInt(a.Estimated_Size || '0');
            const sizeB = parseInt(b.Estimated_Size || '0');
            return sizeB - sizeA;
          default:
            return 0;
        }
      });
      
      setFilteredVideos(videos);
      setCurrentPage(1);
    }
  }, [loading, filteredVideoData, searchTerm, sortBy]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    setVisibleVideos(filteredVideos.slice(startIndex, endIndex));
  }, [filteredVideos, currentPage]);

  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

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
  const pointLayer = {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E9ECEF]">
        <Header />
        <div className="pt-[152px] p-8">
          <div className="max-w-[1200px] mx-auto px-4">
            {/* Header Section Skeleton */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="w-80 h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-[300px] h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="w-40 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Skeleton Video Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-md rounded-xl overflow-hidden shadow-sm border border-white/30">
                  {/* Video Thumbnail Skeleton */}
                  <div className="bg-gray-200/60 h-80 animate-pulse"></div>
                  
                  {/* Video Info Skeleton */}
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-4 h-4 bg-gray-200/60 rounded animate-pulse"></div>
                      <div className="w-20 h-4 bg-gray-200/60 rounded animate-pulse"></div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-4 h-4 bg-gray-200/60 rounded animate-pulse"></div>
                      <div className="w-32 h-4 bg-gray-200/60 rounded animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="w-full h-4 bg-gray-200/60 rounded animate-pulse"></div>
                      <div className="w-3/4 h-4 bg-gray-200/60 rounded animate-pulse"></div>
                      <div className="w-1/2 h-4 bg-gray-200/60 rounded animate-pulse"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-3 bg-gray-200/60 rounded animate-pulse"></div>
                      <div className="w-20 h-3 bg-gray-200/60 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9ECEF]">
      <Header />
      
      <div className="pt-[152px] p-8">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-text-primary hover:text-[#00558c] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Map</span>
              </Link>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-heading font-black text-[#00558c] mb-2">ALL PROTEST VIDEOS</h1>
                <p className="text-text-primary">
                  Showing {filteredVideos.length} of {Math.min(filteredVideoData.length, maxVideos)} videos
                </p>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-primary/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-text-primary placeholder-text-primary/50 focus:ring-2 focus:ring-[#00558c] focus:border-transparent min-w-[300px] transition-all duration-300"
                  />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'location' | 'size')}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-text-primary focus:ring-2 focus:ring-[#00558c] focus:border-transparent transition-all duration-300"
                >
                  <option value="date">Sort by Date</option>
                  <option value="location">Sort by Location</option>
                  <option value="size">Sort by Crowd Size</option>
                </select>
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {visibleVideos.map((video, index) => {
              const videoId = `${video.MediaURL}-${index}`;
              return (
                <div
                  key={videoId}
                  className="bg-white/60 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-white/30 hover:border-white/50 hover:bg-white/70"
                  onClick={() => handleVideoClick(video)}
                >
                  {/* Video Thumbnail */}
                  <div className="bg-gray-50/30 overflow-hidden relative h-80">
                    <video
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[videoId] = el;
                          setMobileVideoAttributes(el);
                          loadVideoThumbnail(el);
                        }
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={`https://fdd.box.com/shared/static/${getModifiedUrl(video.MediaURL)}.mp4`}
                      style={{ backgroundColor: 'transparent' }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-4">
                    <div className="flex items-center space-x-2 text-sm text-text-primary/70 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(video.Date)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-text-primary/70 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{getLocation(video)}</span>
                    </div>
                    
                    <p className="text-text-primary text-sm line-clamp-3 leading-relaxed mb-3">
                      {video.Description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      {video.Estimated_Size && (
                        <div className="flex items-center space-x-1 text-text-primary/70">
                          <Users className="w-4 h-4" />
                          <span>{video.Estimated_Size}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Eye className="w-4 h-4" />
                        <span>View Video</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-text-primary transition-all duration-300"
              >
                Previous
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === pageNum
                          ? 'bg-[#00558c] text-white shadow-lg'
                          : 'bg-white border border-gray-300 hover:bg-gray-50 text-text-primary'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-text-primary transition-all duration-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Credits Section */}
      <div className="w-full max-w-[1200px] mx-auto px-4 py-8 mt-16">
        <div className="w-16 h-0.5 bg-gray-600 mx-auto mb-6"></div>
        <div className="text-center space-y-2 text-base text-gray-800 italic">
          <p className="font-medium">Development and Design by <span className="font-bold">Pavak Patel</span></p>
          <p className="font-medium">Creative direction by <span className="font-bold">Daniel Ackerman</span></p>
        </div>
      </div>

      {/* Modern Glass Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/40 shadow-2xl">
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
                        setMobileVideoAttributes(videoRef.current);
                        loadVideoThumbnail(videoRef.current);
                        videoRef.current.muted = videoMuted;
                      }
                    }}
                    style={{ backgroundColor: 'transparent' }}
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
                <div className="bg-gray-100 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#00558c]" />
                    Location
                  </h4>
                  <p className="text-gray-700 text-lg">{getLocation(selectedVideo)}</p>
                </div>
                
                {/* Date */}
                <div className="bg-gray-100 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-[#00558c]" />
                    Date
                  </h4>
                  <p className="text-gray-700 text-lg">{formatDate(selectedVideo.Date)}</p>
                </div>
                
                {/* Crowd Size */}
                {selectedVideo.Estimated_Size && (
                  <div className="bg-gray-100 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-[#00558c]" />
                      Estimated Crowd Size
                    </h4>
                    <p className="text-gray-700 text-lg">{selectedVideo.Estimated_Size}</p>
                  </div>
                )}
                {/* Description */}
                <div className="bg-gray-100 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedVideo.Description}</p>
                </div>
                
                {/* Map */}
                {selectedVideo.Longitude && selectedVideo.Latitude && (
                  <div className="bg-gray-100 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Map Location</h4>
                    <div className="h-48 rounded-xl overflow-hidden border border-white/40 shadow-lg">
                      <Map
                        ref={mapRef}
                        mapboxAccessToken={MAPBOX_TOKEN}
                        mapStyle="mapbox://styles/mapbox/light-v11"
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
                            <Layer {...pointLayer as any} />
                          </Source>
                        )}
                        <NavigationControl position="bottom-right" showCompass={false} />
                      </Map>
                    </div>
                  </div>
                )}
                
                {/* Source */}
                <div className="bg-gray-100 backdrop-blur-md rounded-2xl p-4 border border-white/30">
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
    </div>
  );
};

export default AllVideosPage;
