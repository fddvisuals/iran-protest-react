import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Play, Calendar, MapPin, Users, Eye, X, Volume2, VolumeX, Pause } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ProtestData } from '../utils/dataFetching';
import { getModifiedUrl } from '../utils/dataFetching';
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mt-[152px] p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00558c] to-[#004778] rounded-full mx-auto animate-pulse mb-4"></div>
                <p className="text-gray-600 font-medium">Loading videos...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      
      <div className="mt-[152px] p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-white/70 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Map</span>
              </Link>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">All Protest Videos</h1>
                <p className="text-white/70">
                  Showing {filteredVideos.length} of {Math.min(filteredVideoData.length, maxVideos)} videos
                </p>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent min-w-[300px] transition-all duration-300"
                  />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'location' | 'size')}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                >
                  <option value="date" className="text-gray-900">Sort by Date</option>
                  <option value="location" className="text-gray-900">Sort by Location</option>
                  <option value="size" className="text-gray-900">Sort by Crowd Size</option>
                </select>
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {visibleVideos.map((video, index) => (
              <div
                key={`${video.MediaURL}-${index}`}
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-white/20 hover:border-cyan-400/50"
                onClick={() => handleVideoClick(video)}
              >
                {/* Video Thumbnail */}
                <div className="bg-black/20 overflow-hidden relative flex items-center justify-center min-h-[200px] max-h-[400px]">
                  <video
                    className="w-full h-auto max-h-[400px] object-contain transition-transform duration-300 group-hover:scale-105"
                    src={`https://fdd.box.com/shared/static/${getModifiedUrl(video.MediaURL)}.mp4`}
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-800 ml-1" />
                    </div>
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="p-4">
                  <div className="flex items-center space-x-2 text-sm text-white/70 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(video.Date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-white/70 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{getLocation(video)}</span>
                  </div>
                  
                  <p className="text-white text-sm line-clamp-3 leading-relaxed mb-3">
                    {video.Description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    {video.Estimated_Size && (
                      <div className="flex items-center space-x-1 text-white/70">
                        <Users className="w-4 h-4" />
                        <span>{video.Estimated_Size} people</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1 text-cyan-400">
                      <Eye className="w-4 h-4" />
                      <span>View Video</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 text-white transition-all duration-300"
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
                          ? 'bg-cyan-500 text-white shadow-lg'
                          : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white'
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
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 text-white transition-all duration-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Minimalist Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="text-2xl font-bold text-white">Video Details</h3>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white text-2xl transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content - Portrait Video Left, Info Right */}
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Video */}
              <div className="lg:w-1/2 p-6 flex flex-col items-center">
                <div className="w-full max-w-md relative bg-black rounded-lg overflow-hidden">
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
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 flex flex-col justify-between p-4">
                    {/* Top Controls */}
                    <div className="flex justify-end">
                      <button
                        onClick={toggleMute}
                        className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        {videoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Bottom Controls */}
                    <div className="flex justify-center">
                      <button
                        onClick={togglePlay}
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      >
                        {videoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Information */}
              <div className="lg:w-1/2 p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-6">
                  {/* Location Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-cyan-400" />
                      Location
                    </h4>
                    <p className="text-white/80 text-lg">{getLocation(selectedVideo)}</p>
                  </div>
                  
                  {/* Date */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
                      Date
                    </h4>
                    <p className="text-white/80 text-lg">{formatDate(selectedVideo.Date)}</p>
                  </div>
                  
                  {/* Crowd Size */}
                  {selectedVideo.Estimated_Size && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-cyan-400" />
                        Estimated Crowd Size
                      </h4>
                      <p className="text-white/80 text-lg">{selectedVideo.Estimated_Size} people</p>
                    </div>
                  )}
                  
                  {/* Description */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Description</h4>
                    <p className="text-white/80 leading-relaxed">{selectedVideo.Description}</p>
                  </div>
                  
                  {/* Map */}
                  {selectedVideo.Longitude && selectedVideo.Latitude && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Map Location</h4>
                      <div className="h-48 rounded-lg overflow-hidden border border-white/20">
                        <Map
                          ref={mapRef}
                          mapboxAccessToken={MAPBOX_TOKEN}
                          mapStyle="mapbox://styles/mapbox/dark-v11"
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
                  
                  {/* Casualties */}
                  {(selectedVideo.Injured || selectedVideo.Arrested || selectedVideo.Killed) && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Casualties</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedVideo.Injured && (
                          <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded-lg text-center">
                            <div className="text-xs text-yellow-300 font-medium">Injured</div>
                            <div className="text-lg font-bold text-yellow-100">{selectedVideo.Injured}</div>
                          </div>
                        )}
                        {selectedVideo.Arrested && (
                          <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg text-center">
                            <div className="text-xs text-blue-300 font-medium">Arrested</div>
                            <div className="text-lg font-bold text-blue-100">{selectedVideo.Arrested}</div>
                          </div>
                        )}
                        {selectedVideo.Killed && (
                          <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg text-center">
                            <div className="text-xs text-red-300 font-medium">Killed</div>
                            <div className="text-lg font-bold text-red-100">{selectedVideo.Killed}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Source Link */}
                  {selectedVideo.Link && (
                    <div>
                      <a
                        href={selectedVideo.Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40"
                      >
                        <span>View Original Source</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 6V8H5V19H16V14H18V20C18 20.2652 17.8946 20.5196 17.7071 20.7071C17.5196 20.8946 17.2652 21 17 21H4C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V7C3 6.73478 3.10536 6.48043 3.29289 6.29289C3.48043 6.10536 3.73478 6 4 6H10ZM21 3V12L17.206 8.207L11.207 14.207L9.793 12.793L15.792 6.793L12 3H21Z" fill="currentColor" />
                        </svg>
                      </a>
                    </div>
                  )}
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
