/**
 * Utility functions for video handling and mobile compatibility
 */

/**
 * Sets mobile-friendly video attributes for inline playback
 * @param videoElement - The HTML video element
 */
export const setMobileVideoAttributes = (videoElement: HTMLVideoElement) => {
  // Set playsInline for iOS Safari
  videoElement.setAttribute('playsinline', 'true');
  videoElement.setAttribute('webkit-playsinline', 'true');
  
  // Additional mobile optimizations
  videoElement.style.touchAction = 'manipulation';
  
  return videoElement;
};

/**
 * Gets the default video attributes for inline playback
 */
export const getVideoAttributes = () => ({
  playsInline: true,
  'webkit-playsinline': 'true' as const,
  muted: true,
  loop: true,
  preload: 'metadata' as const,
});

/**
 * Checks if the current device is likely a mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

/**
 * Handles video play with proper error handling
 * @param videoElement - The HTML video element
 */
export const playVideoSafely = async (videoElement: HTMLVideoElement): Promise<void> => {
  try {
    await videoElement.play();
  } catch (error) {
    console.log('Video autoplay prevented:', error);
    // On mobile, we might need user interaction first
    if (isMobileDevice()) {
      console.log('Mobile device detected - video play requires user interaction');
    }
  }
};

/**
 * Forces video to load and show first frame on mobile devices
 * @param videoElement - The HTML video element
 */
export const loadVideoThumbnail = (videoElement: HTMLVideoElement): Promise<void> => {
  return new Promise((resolve) => {
    const handleLoadedData = () => {
      // Force the video to seek to first frame to show thumbnail
      videoElement.currentTime = 0.1;
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      resolve();
    };

    const handleSeeked = () => {
      videoElement.removeEventListener('seeked', handleSeeked);
      resolve();
    };

    if (videoElement.readyState >= 2) {
      // Video is already loaded
      videoElement.currentTime = 0.1;
      videoElement.addEventListener('seeked', handleSeeked);
    } else {
      videoElement.addEventListener('loadeddata', handleLoadedData);
      // Force load by setting currentTime and calling load()
      videoElement.load();
    }
  });
};

/**
 * Enhanced mobile video attributes for better thumbnail loading
 */
export const getMobileVideoAttributes = () => ({
  playsInline: true,
  'webkit-playsinline': 'true' as const,
  muted: true,
  preload: 'metadata' as const,
  controls: false,
  'x-webkit-airplay': 'deny' as const,
  disablePictureInPicture: true,
  style: { 
    backgroundColor: 'transparent',
    objectFit: 'cover' as const
  }
});
