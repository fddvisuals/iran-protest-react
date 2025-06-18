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
