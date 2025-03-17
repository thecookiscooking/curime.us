/**
 * VIDEO SLIDESHOW IMPLEMENTATION
 * 
 * This script creates an automated video slideshow with the following features:
 * - Smooth transitions between videos
 * - Responsive design (adapts to mobile/desktop)
 * - Error handling and retry logic
 * - Loading state management
 * - Performance optimizations
 * 
 * The general flow is:
 * 1. Configure videos and their sources
 * 2. Create video elements and add them to the page
 * 3. Handle loading states and errors
 * 4. Manage transitions between videos
 * 5. Handle window resizing and visibility changes
 */

// ====================================
// VIDEO CONFIGURATION AND SETUP
// ====================================

// Define video sources and their variations
const videos = [
    {
        src: 'https://player.vimeo.com/video/1066647564?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&controls=0&quality=1080p&dnt=1',
        title: 'Rose Video'
    },
    {
        src: 'https://player.vimeo.com/video/1066647579?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&controls=0&quality=1080p&dnt=1',
        title: 'Maple Video'
    },
    {
        src: 'https://player.vimeo.com/video/1066647592?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&controls=0&quality=1080p&dnt=1',
        title: 'ElPaso Video'
    },
    {
        src: 'https://player.vimeo.com/video/1066647608?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&controls=0&quality=1080p&dnt=1',
        title: 'Voltaje Video'
    }
];

// Detect if user is on a mobile device by checking screen size and user agent
const isMobile = () => {
    return window.matchMedia('(max-width: 768px)').matches || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Keep track of current mobile state
let currentIsMobile = isMobile();

// Shuffle array randomly (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Randomize the order of videos for variety
shuffleArray(videos);

// ====================================
// STATE MANAGEMENT
// ====================================

const slideshowContainer = document.querySelector('.slideshow');
let currentSlide = 0;          // Index of current video
let slides = [];               // Array to store video elements
let isTransitioning = false;   // Flag to prevent multiple transitions

// ====================================
// VIDEO CREATION AND SETUP
// ====================================

// Create video elements for each video in the configuration
videos.forEach((videoConfig, index) => {
    // Create container for video
    const slideDiv = document.createElement('div');
    slideDiv.className = 'video-slide';
    
    // Create iframe for Vimeo player
    const iframe = document.createElement('iframe');
    iframe.src = videoConfig.src;
    iframe.allow = 'autoplay; fullscreen';
    iframe.loading = index === 0 ? 'eager' : 'lazy';
    
    // Set up slide visibility
    if (index === 0) {
        slideDiv.classList.add('active');
    }
    
    // Add to DOM and store reference
    slideDiv.appendChild(iframe);
    slideshowContainer.appendChild(slideDiv);
    slides.push({ div: slideDiv, iframe: iframe });
});

// ====================================
// SLIDESHOW MANAGEMENT
// ====================================

/**
 * Handles transition between videos
 */
function changeSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    
    // Track slide change in analytics
    try {
        window.plausible('slideChange', { 
            props: { slideIndex: currentSlide }
        });
    } catch (e) {
        console.error('Analytics error:', e);
    }
    
    // Transition to next video
    slides[currentSlide].div.classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].div.classList.add('active');
    
    isTransitioning = false;
}

// Change slides every 10 seconds
setInterval(changeSlide, 10000);

// ====================================
// RESPONSIVE HANDLING
// ====================================

/**
 * Debounce function to limit how often a function is called
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resizing with debouncing for performance
const debouncedResize = debounce(() => {
    const newIsMobile = isMobile();
    if (newIsMobile !== currentIsMobile) {
        currentIsMobile = newIsMobile;
    }
}, 250);

// Listen for window resize events
window.addEventListener('resize', debouncedResize);

// ====================================
// VIDEO PROTECTION
// ====================================

// Create and initialize video slides
function initializeVideoSlides() {
    const slideshow = document.querySelector('.slideshow');
    let activeSlide = null;

    videos.forEach((videoConfig, index) => {
        const slide = document.createElement('div');
        slide.className = 'video-slide';
        
        const video = document.createElement('video');
        video.playsInline = true;
        video.muted = true;
        video.loop = true;
        
        // Add video protection attributes
        video.controlsList = 'nodownload nofullscreen noremoteplayback';
        video.disablePictureInPicture = true;
        video.disableRemotePlayback = true;
        
        slide.appendChild(video);
        slideshow.appendChild(slide);

        // Initialize HLS player for this video
        initializeHLSPlayer(video, videoConfig);

        // Make first slide active
        if (index === 0) {
            slide.classList.add('active');
            activeSlide = slide;
        }
    });

    return activeSlide;
}

// Handle video transitions
function startVideoTransitions() {
    const slides = document.querySelectorAll('.video-slide');
    let currentIndex = 0;

    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 8000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const activeSlide = initializeVideoSlides();
    if (activeSlide) {
        startVideoTransitions();
    }

    // Additional protection measures
    document.addEventListener('keydown', (e) => {
        // Prevent common video download shortcuts
        if (
            (e.key === 'S' && (e.ctrlKey || e.metaKey)) || // Save
            (e.key === 'I' && (e.ctrlKey || e.metaKey)) || // Inspect
            (e.key === 'U' && (e.ctrlKey || e.metaKey))    // View Source
        ) {
            e.preventDefault();
            return false;
        }
    });
}); 