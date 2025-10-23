class NumberGuessingGame {
    constructor() {
        this.secretNumber = '';
        this.attempts = 0;
        this.maxAttempts = 10;
        this.gameOver = false;
        this.guesses = [];
        this.digitCount = 4;
        this.allowDuplicates = false;
        this.gameStarted = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateGameSettings();
        this.showStartButton();
    }
    
    initializeElements() {
        this.guessInput = document.getElementById('guess-input');
        this.submitButton = document.getElementById('submit-guess');
        this.startGameButton = document.getElementById('start-game');
        this.newGameButton = document.getElementById('new-game');
        this.attemptCount = document.getElementById('attempt-count');
        this.attemptLimit = document.getElementById('attempt-limit');
        this.gameStatus = document.getElementById('game-status');
        this.guessesList = document.getElementById('guesses-list');
        this.digitCountSelect = document.getElementById('digit-count');
        this.allowDuplicatesCheckbox = document.getElementById('allow-duplicates');
        this.maxAttemptsSelect = document.getElementById('max-attempts');
        this.headerDescription = document.getElementById('header-description');
    }
    
    setupEventListeners() {
        this.submitButton.addEventListener('click', () => this.submitGuess());
        this.startGameButton.addEventListener('click', () => this.startNewGame());
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (this.gameStarted) {
                    this.submitGuess();
                } else {
                    this.startNewGame();
                }
            }
        });
        
        // Only allow digits in input
        this.guessInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        
        // Settings change listeners
        this.digitCountSelect.addEventListener('change', () => this.updateGameSettings());
        this.allowDuplicatesCheckbox.addEventListener('change', () => this.updateGameSettings());
        this.maxAttemptsSelect.addEventListener('change', () => this.updateGameSettings());
    }
    
    generateSecretNumber() {
        const secret = [];
        
        if (this.allowDuplicates) {
            // Allow duplicates - just pick random digits
            for (let i = 0; i < this.digitCount; i++) {
                secret.push(Math.floor(Math.random() * 10));
            }
        } else {
            // No duplicates - shuffle and take first N digits
            const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            for (let i = 0; i < this.digitCount; i++) {
                const randomIndex = Math.floor(Math.random() * digits.length);
                secret.push(digits.splice(randomIndex, 1)[0]);
            }
        }
        
        return secret.join('');
    }
    
    updateGameSettings() {
        this.digitCount = parseInt(this.digitCountSelect.value);
        this.allowDuplicates = this.allowDuplicatesCheckbox.checked;
        const maxAttemptsValue = this.maxAttemptsSelect.value;
        this.maxAttempts = maxAttemptsValue === 'infinite' ? Infinity : parseInt(maxAttemptsValue);
        
        // Update UI elements
        this.guessInput.maxLength = this.digitCount;
        this.guessInput.placeholder = `Enter ${this.digitCount} digit${this.digitCount > 1 ? 's' : ''}${this.allowDuplicates ? ' (duplicates allowed)' : ''}`;
        
        // Update attempt limit display
        if (this.maxAttempts === Infinity) {
            this.attemptLimit.textContent = '/∞';
        } else {
            this.attemptLimit.textContent = `/${this.maxAttempts}`;
        }
        
        // Update header description
        this.updateHeaderDescription();
        
        // Reset game if settings changed during play
        if (this.gameStarted) {
            this.startNewGame();
        }
    }
    
    startNewGame() {
        this.secretNumber = this.generateSecretNumber();
        this.attempts = 0;
        this.gameOver = false;
        this.guesses = [];
        this.gameStarted = true;
        
        // Clear the guesses list
        this.guessesList.innerHTML = '';
        
        this.updateUI();
        this.updateHeaderDescription();
        this.guessInput.value = '';
        this.guessInput.disabled = false;
        this.submitButton.disabled = false;
        this.submitButton.style.display = 'inline-block';
        this.startGameButton.style.display = 'none';
        this.newGameButton.style.display = 'none';
        
        console.log('Secret number:', this.secretNumber); // For debugging
    }
    
    validateGuess(guess) {
        if (guess.length !== this.digitCount) {
            return { valid: false, message: `Please enter exactly ${this.digitCount} digit${this.digitCount > 1 ? 's' : ''}!` };
        }
        
        // Check for duplicate digits only if duplicates are not allowed
        if (!this.allowDuplicates) {
            const uniqueDigits = new Set(guess);
            if (uniqueDigits.size !== this.digitCount) {
                return { valid: false, message: 'All digits must be different!' };
            }
        }
        
        return { valid: true };
    }
    
    calculateFeedback(guess) {
        const secret = this.secretNumber.split('');
        const guessArray = guess.split('');
        
        let correctPosition = 0;
        let correctNumber = 0;
        
        // Count correct positions
        for (let i = 0; i < this.digitCount; i++) {
            if (secret[i] === guessArray[i]) {
                correctPosition++;
            }
        }
        
        // Count correct numbers (including those in correct position)
        for (let i = 0; i < this.digitCount; i++) {
            if (secret.includes(guessArray[i])) {
                correctNumber++;
            }
        }
        
        // Subtract correct positions to get only wrong positions
        const wrongPosition = correctNumber - correctPosition;
        const wrongNumber = this.digitCount - correctNumber;
        
        return {
            correctPosition,
            wrongPosition,
            wrongNumber
        };
    }
    
    submitGuess() {
        if (this.gameOver) return;
        
        const guess = this.guessInput.value.trim();
        const validation = this.validateGuess(guess);
        
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }
        
        this.attempts++;
        const feedback = this.calculateFeedback(guess);
        
        // Store the guess and feedback
        const guessData = {
            number: guess,
            feedback: feedback,
            attempt: this.attempts
        };
        
        this.guesses.push(guessData);
        this.displayGuess(guessData);
        
        // Check win condition
        if (feedback.correctPosition === 4) {
            this.gameWon();
            return;
        }
        
        // Check lose condition (only if not infinite)
        if (this.maxAttempts !== Infinity && this.attempts >= this.maxAttempts) {
            this.gameLost();
            return;
        }
        
        this.updateUI();
        this.guessInput.value = '';
        this.guessInput.focus();
    }
    
    displayGuess(guessData) {
        const guessElement = document.createElement('div');
        guessElement.className = 'guess-item';
        
        const feedback = guessData.feedback;
        const feedbackHTML = `
            <div class="guess-feedback">
                <div class="feedback-item feedback-correct">
                    🟢 ${feedback.correctPosition}
                </div>
                <div class="feedback-item feedback-partial">
                    🟡 ${feedback.wrongPosition}
                </div>
                <div class="feedback-item feedback-wrong">
                    🔴 ${feedback.wrongNumber}
                </div>
            </div>
        `;
        
        guessElement.innerHTML = `
            <div class="guess-number">${guessData.number}</div>
            ${feedbackHTML}
        `;
        
        this.guessesList.appendChild(guessElement);
        this.guessesList.scrollTop = this.guessesList.scrollHeight;
    }
    
    gameWon() {
        this.gameOver = true;
        this.gameStatus.textContent = `🎉 Congratulations! You guessed it in ${this.attempts} attempt${this.attempts > 1 ? 's' : ''}!`;
        this.gameStatus.className = 'status success';
        this.guessInput.disabled = true;
        this.submitButton.disabled = true;
        this.submitButton.style.display = 'none';
        this.newGameButton.style.display = 'inline-block';
        
        // Add success divider
        this.addSuccessDivider();
        
        // Add success animation
        document.querySelector('.container').classList.add('success');
        setTimeout(() => {
            document.querySelector('.container').classList.remove('success');
        }, 600);
    }
    
    gameLost() {
        this.gameOver = true;
        this.gameStatus.textContent = `😔 Game Over! The number was ${this.secretNumber}`;
        this.gameStatus.className = 'status error';
        this.guessInput.disabled = true;
        this.submitButton.disabled = true;
        this.submitButton.style.display = 'none';
        this.newGameButton.style.display = 'inline-block';
        
        // Add error animation
        document.querySelector('.container').classList.add('error');
        setTimeout(() => {
            document.querySelector('.container').classList.remove('error');
        }, 600);
    }
    
    showError(message) {
        this.gameStatus.textContent = message;
        this.gameStatus.className = 'status error';
        
        // Add error animation
        document.querySelector('.container').classList.add('error');
        setTimeout(() => {
            document.querySelector('.container').classList.remove('error');
        }, 600);
        
        // Clear error after 3 seconds
        setTimeout(() => {
            if (!this.gameOver) {
                this.gameStatus.textContent = 'Enter your guess below!';
                this.gameStatus.className = 'status';
            }
        }, 3000);
    }
    
    addSuccessDivider() {
        const divider = document.createElement('div');
        divider.className = 'success-divider';
        divider.innerHTML = `
            <div class="success-marker">
                <span class="success-text">✅ CORRECT GUESS!</span>
                <span class="success-number">${this.secretNumber}</span>
            </div>
        `;
        this.guessesList.appendChild(divider);
        this.guessesList.scrollTop = this.guessesList.scrollHeight;
    }
    
    showStartButton() {
        this.submitButton.style.display = 'none';
        this.startGameButton.style.display = 'inline-block';
        this.newGameButton.style.display = 'none';
        this.guessInput.disabled = true;
    }
    
    updateHeaderDescription() {
        if (this.gameStarted) {
            const duplicateText = this.allowDuplicates ? ' (duplicates allowed)' : ' (no duplicates)';
            this.headerDescription.textContent = `I'm thinking of a ${this.digitCount}-digit number${duplicateText}. Can you guess it?`;
        } else {
            this.headerDescription.textContent = 'Configure your game settings and start playing!';
        }
    }
    
    updateUI() {
        this.attemptCount.textContent = this.attempts;
        
        if (!this.gameOver) {
            if (this.maxAttempts === Infinity) {
                this.gameStatus.textContent = 'Enter your guess! (Infinite attempts)';
            } else {
                const remaining = this.maxAttempts - this.attempts;
                this.gameStatus.textContent = `${remaining} attempt${remaining !== 1 ? 's' : ''} remaining. Enter your guess!`;
            }
            this.gameStatus.className = 'status';
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NumberGuessingGame();
});
