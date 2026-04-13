// ============================================
// LOADING SCREEN ANIMATION WITH GIF
// ============================================

let pageFullyLoaded = false;
let minimumLoadTime = 3500;
let loadingStartTime = Date.now();

// Function to hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
        console.log('Hiding loading screen');
        
        // Fade out
        loadingScreen.style.opacity = '0';
        
        // After fade, hide completely
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('active');
            console.log('Loading screen hidden');
        }, 800);
    }
}

// Start progress animation
function updateLoadingProgress() {
    const loadingBarFill = document.querySelector('.loading-bar-fill');
    
    if (!loadingBarFill) {
        console.error('Loading bar not found');
        return;
    }
    
    let width = 0;
    
    const interval = setInterval(() => {
        width += Math.random() * 15 + 5;
        
        if (width > 90) {
            width = 90;
        }
        
        loadingBarFill.style.width = width + '%';
        
        if (pageFullyLoaded) {
            clearInterval(interval);
            loadingBarFill.style.width = '100%';
        }
    }, 300);
    
    // Safety timeout
    setTimeout(() => {
        clearInterval(interval);
        loadingBarFill.style.width = '100%';
    }, minimumLoadTime);
}

// Check and hide loading screen
function checkAndHideLoadingScreen() {
    const elapsedTime = Date.now() - loadingStartTime;
    const timeRemaining = minimumLoadTime - elapsedTime;
    
    if (timeRemaining > 0) {
        setTimeout(hideLoadingScreen, timeRemaining);
    } else {
        hideLoadingScreen();
    }
}

// Wait for page to fully load
window.addEventListener('load', function() {
    pageFullyLoaded = true;
    console.log('Page loaded');
    checkAndHideLoadingScreen();
});

// Fallback: Force hide after 5 seconds
setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && loadingScreen.style.display !== 'none') {
        console.log('Forcing loading screen to hide (safety)');
        hideLoadingScreen();
    }
}, 5000);

// Allow skipping with Enter or Space
document.addEventListener('keydown', function(event) {
    if ((event.key === 'Enter' || event.key === ' ')) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log('Skipping loading via keyboard');
            hideLoadingScreen();
        }
    }
});

// Initialize
console.log('Loading system initialized');
updateLoadingProgress();
