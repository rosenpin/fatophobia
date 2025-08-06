class BodyPerceptionAssessment {
    constructor() {
        this.totalImages = 12;
        this.currentImageIndex = 0;
        this.gameData = {
            responses: [],
            imageOrder: [],
            startTime: null,
            endTime: null
        };
        
        this.elements = {
            welcomeScreen: document.getElementById('welcome-screen'),
            gameScreen: document.getElementById('game-screen'),
            resultsScreen: document.getElementById('results-screen'),
            loading: document.getElementById('loading'),
            startBtn: document.getElementById('start-btn'),
            notFatBtn: document.getElementById('not-fat-btn'),
            fatBtn: document.getElementById('fat-btn'),
            restartBtn: document.getElementById('restart-btn'),
            shareBtn: document.getElementById('share-btn'),
            currentImage: document.getElementById('current-image'),
            progress: document.getElementById('progress'),
            progressText: document.getElementById('progress-text'),
            notFatGrid: document.getElementById('not-fat-grid'),
            fatGrid: document.getElementById('fat-grid'),
            userMarker: document.getElementById('user-marker'),
            spectrumText: document.getElementById('spectrum-text'),
            userScore: document.getElementById('user-score'),
            userPercentile: document.getElementById('user-percentile'),
            offlineIndicator: document.getElementById('offline-indicator')
        };
        
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.generateImageOrder();
    }
    
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.notFatBtn.addEventListener('click', () => this.recordResponse(false));
        this.elements.fatBtn.addEventListener('click', () => this.recordResponse(true));
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.shareBtn.addEventListener('click', () => this.shareResults());
    }
    
    generateImageOrder() {
        // Create array of image numbers 1-12
        const imageNumbers = Array.from({ length: this.totalImages }, (_, i) => i + 1);
        
        // Shuffle using Fisher-Yates algorithm for truly random order
        for (let i = imageNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [imageNumbers[i], imageNumbers[j]] = [imageNumbers[j], imageNumbers[i]];
        }
        
        this.gameData.imageOrder = imageNumbers;
    }
    
    startGame() {
        this.gameData.startTime = new Date();
        this.gameData.responses = [];
        this.currentImageIndex = 0;
        
        this.showScreen('game');
        this.loadCurrentImage();
        this.updateProgress();
    }
    
    loadCurrentImage() {
        const imageNumber = this.gameData.imageOrder[this.currentImageIndex];
        const imagePath = `src/${imageNumber}.png`;
        
        // Preload next image for smoother experience
        if (this.currentImageIndex < this.totalImages - 1) {
            const nextImageNumber = this.gameData.imageOrder[this.currentImageIndex + 1];
            const nextImage = new Image();
            nextImage.src = `src/${nextImageNumber}.png`;
        }
        
        this.elements.currentImage.src = imagePath;
        this.elements.currentImage.classList.add('fade-in');
        
        // Remove fade-in class after animation
        setTimeout(() => {
            this.elements.currentImage.classList.remove('fade-in');
        }, 500);
    }
    
    updateProgress() {
        const progressPercentage = (this.currentImageIndex / this.totalImages) * 100;
        this.elements.progress.style.width = `${progressPercentage}%`;
        this.elements.progressText.textContent = `${this.currentImageIndex + 1} / ${this.totalImages}`;
    }
    
    recordResponse(isFat) {
        const imageNumber = this.gameData.imageOrder[this.currentImageIndex];
        const response = {
            imageNumber: imageNumber,
            isFat: isFat,
            responseTime: new Date() - this.gameData.startTime,
            position: this.currentImageIndex + 1
        };
        
        this.gameData.responses.push(response);
        
        // Animate the image out
        const animationClass = isFat ? 'swipe-right' : 'swipe-left';
        this.elements.currentImage.classList.add(animationClass);
        
        // Move to next image after animation
        setTimeout(() => {
            this.elements.currentImage.classList.remove(animationClass);
            this.nextImage();
        }, 500);
    }
    
    nextImage() {
        this.currentImageIndex++;
        
        if (this.currentImageIndex >= this.totalImages) {
            this.finishGame();
        } else {
            this.loadCurrentImage();
            this.updateProgress();
        }
    }
    
    async finishGame() {
        this.gameData.endTime = new Date();
        this.showLoading(true);
        
        try {
            // Attempt to submit data to server
            await this.submitResults();
        } catch (error) {
            console.warn('Failed to submit to server, using fallback:', error);
            this.useLocalFallback();
        }
        
        this.showLoading(false);
        this.showResults();
    }
    
    async submitResults() {
        const response = await fetch('https://fatophobiaapi.rosenpin.io/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                responses: this.gameData.responses,
                imageOrder: this.gameData.imageOrder,
                totalTime: this.gameData.endTime - this.gameData.startTime,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        this.gameData.serverResult = result;
        this.gameData.percentile = result.percentile;
        this.gameData.category = result.category;
        this.gameData.score = result.score || this.calculateLocalScore();
    }
    
    useLocalFallback() {
        // Calculate local score based on transition between images 5 and 6
        const fatResponses = this.gameData.responses.filter(r => r.isFat);
        const fatImageNumbers = fatResponses.map(r => r.imageNumber);
        
        // Default assumption: images 6-12 are considered "fat" by average person
        const defaultFatImages = [6, 7, 8, 9, 10, 11, 12];
        const userFatImages = fatImageNumbers;
        
        // Calculate how much more/less likely user is to perceive as fat
        const defaultFatCount = defaultFatImages.length;
        const userFatCount = userFatImages.length;
        
        // Simple percentile calculation (0-100)
        // If user marked fewer as fat = lower percentile (less likely to perceive as fat)
        // If user marked more as fat = higher percentile (more likely to perceive as fat)
        let percentile = 50; // Start at middle
        
        if (userFatCount < defaultFatCount) {
            percentile = Math.max(1, 50 - ((defaultFatCount - userFatCount) / defaultFatCount) * 40);
        } else if (userFatCount > defaultFatCount) {
            percentile = Math.min(99, 50 + ((userFatCount - defaultFatCount) / this.totalImages) * 40);
        }
        
        this.gameData.percentile = Math.max(1, Math.min(99, Math.round(percentile)));
        this.gameData.category = this.getCategoryFromPercentile(percentile);
        this.gameData.score = this.calculateLocalScore();
        this.gameData.usedFallback = true;
    }
    
    calculateLocalScore() {
        // Calculate score based on how many images marked as fat
        // Score is number of "fat" responses out of 12, as a percentage
        const fatCount = this.gameData.responses.filter(r => r.isFat).length;
        return Math.round((fatCount / this.totalImages) * 100);
    }
    
    getCategoryFromPercentile(percentile) {
        if (percentile < 25) return "Less likely to perceive as overweight";
        if (percentile < 50) return "Somewhat less likely to perceive as overweight";
        if (percentile < 75) return "About average in weight perception";
        return "More likely to perceive as overweight";
    }
    
    showResults() {
        this.showScreen('results');
        this.displayImageGrids();
        this.displaySpectrum();
    }
    
    displayImageGrids() {
        const fatResponses = this.gameData.responses.filter(r => r.isFat);
        const notFatResponses = this.gameData.responses.filter(r => !r.isFat);
        
        this.populateGrid(this.elements.notFatGrid, notFatResponses);
        this.populateGrid(this.elements.fatGrid, fatResponses);
    }
    
    populateGrid(gridElement, responses) {
        gridElement.innerHTML = '';
        
        responses.forEach((response, index) => {
            setTimeout(() => {
                const img = document.createElement('img');
                img.src = `src/${response.imageNumber}.png`;
                img.classList.add('grid-image', 'animate-in');
                img.alt = `Image ${response.imageNumber}`;
                gridElement.appendChild(img);
            }, index * 100);
        });
    }
    
    displaySpectrum() {
        const percentile = this.gameData.percentile;
        const category = this.gameData.category;
        const score = this.gameData.score;
        
        // Display score and percentile immediately
        this.elements.userScore.textContent = `${score}/100`;
        this.elements.userPercentile.textContent = `${percentile}th`;
        
        setTimeout(() => {
            // Animate marker to position
            this.elements.userMarker.style.left = `${percentile}%`;
            this.elements.userMarker.classList.add('animate');
            
            // Update text
            this.elements.spectrumText.innerHTML = `
                <strong>${category}</strong>
            `;
            
            // Show offline indicator if needed
            if (this.gameData.usedFallback) {
                this.elements.offlineIndicator.style.display = 'block';
            }
        }, 1000);
    }
    
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        this.elements[screenName + 'Screen'].classList.add('active');
    }
    
    showLoading(show) {
        if (show) {
            this.elements.loading.classList.add('active');
        } else {
            this.elements.loading.classList.remove('active');
        }
    }
    
    
    restartGame() {
        this.generateImageOrder();
        this.startGame();
    }
    
    shareResults() {
        const shareText = `I just took a body perception assessment! I scored in the ${this.gameData.percentile}th percentile. Take the test yourself!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Body Perception Assessment Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback for browsers without Web Share API
            navigator.clipboard.writeText(`${shareText} ${window.location.href}`)
                .then(() => {
                    alert('Results copied to clipboard!');
                })
                .catch(() => {
                    // Further fallback
                    const textArea = document.createElement('textarea');
                    textArea.value = `${shareText} ${window.location.href}`;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Results copied to clipboard!');
                });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BodyPerceptionAssessment();
});

// Service worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}