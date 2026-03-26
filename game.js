// ============================================
// CRYPTOGRAPHY GAME - MAIN GAME LOGIC
// ============================================

// Game State
const gameState = {
    currentChallenge: null,
    score: 0,
    completedChallenges: new Set(),
    timeLeft: 0,
    timerInterval: null,
    hintShown: false
};

// Challenge Data - All 10 Challenges
const challenges = [
    {
        id: 0,
        title: "Base64 Basics",
        description: "Decode the Base64 encoded message. Base64 uses 64 printable characters to represent binary data.",
        type: "base64",
        encrypted: "U0VDUkVU",
        answer: "SECRET",
        timeLimit: 30,
        hint: "This is a Base64 encoded word. Remember, Base64 uses letters A-Z, a-z, digits 0-9, +, and /. Try using an online Base64 decoder or work it out step by step."
    },
    {
        id: 1,
        title: "Caesar Shift 1",
        description: "Decrypt this Caesar Cipher. The message was shifted 3 positions forward in the alphabet.",
        type: "caesar",
        encrypted: "KHOOR ZRUOG",
        answer: "HELLO WORLD",
        timeLimit: 40,
        shift: 3,
        hint: "Each letter is shifted forward by 3 positions. Shift backward 3 positions to decrypt. H→E, K→H, etc."
    },
    {
        id: 2,
        title: "Caesar Shift 2",
        description: "Decrypt this Caesar Cipher. The message was shifted 5 positions forward.",
        type: "caesar",
        encrypted: "MJQQT BTWQI",
        answer: "HELLO WORLD",
        timeLimit: 40,
        shift: 5,
        hint: "Shift each letter backward by 5 positions in the alphabet. M→H, J→E, etc."
    },
    {
        id: 3,
        title: "Substitution Code",
        description: "Decrypt using the Atbash Cipher, where A↔Z, B↔Y, C↔X, etc. The alphabet is completely reversed.",
        type: "substitution",
        encrypted: "HVOOL DLIOW",
        answer: "HELLO WORLD",
        timeLimit: 80,
        hint: "In Atbash, each letter maps to its opposite: A=Z, B=Y, C=X, D=W, E=V, F=U, G=T, H=S, etc. Apply this mapping to decrypt."
    },
    {
        id: 4,
        title: "Vigenère Easy",
        description: "Decrypt this Vigenère Cipher. The keyword is: CIPHER",
        type: "vigenere",
        encrypted: "JMASSVPKGFTK",
        answer: "HELLOENCRYPT",
        timeLimit: 60,
        keyword: "CIPHER",
        hint: "Use the keyword CIPHER repeated. Align it under the ciphertext and subtract each keyword letter value from the ciphertext letter. C=2, I=8, P=15, H=7, E=4, R=17."
    },
    {
        id: 5,
        title: "Base64 Advanced",
        description: "Decode this longer Base64 encoded message. Remember the decoding process from Challenge 1.",
        type: "base64",
        encrypted: "Q1JZUFRPR1JBUEhZ",
        answer: "CRYPTOGRAPHY",
        timeLimit: 45,
        hint: "This is a Base64 encoded word. Decode it using the Base64 alphabet. Each character represents 6 bits of data."
    },
    {
        id: 6,
        title: "Caesar Mixed",
        description: "Decrypt this Caesar Cipher. The shift value is unknown. Try all 26 possible shifts to find readable text.",
        type: "caesar",
        encrypted: "KHOOR",
        answer: "HELLO",
        timeLimit: 60,
        shift: 3,
        hint: "Try different shift values. The shift could be anywhere from 1 to 25. When you get readable words, you've found the right shift!"
    },
    {
        id: 7,
        title: "Vigenère Medium",
        description: "Decrypt this Vigenère Cipher. The keyword is: SECRET",
        type: "vigenere",
        encrypted: "VIHVRWLLGSELW",
        answer: "DEFENDTHEBASE",
        timeLimit: 75,
        keyword: "SECRET",
        hint: "The keyword SECRET repeats through the message. Subtract: S=18, E=4, C=2, R=17, E=4, T=19 from each ciphertext letter. S.E.C.R.E.T.S.E.C.R.E.T.S"
    },
    {
        id: 8,
        title: "Substitution Hard",
        description: "Decrypt using ROT13 cipher. In ROT13, each letter is rotated 13 positions. (A→N, B→O, etc.)",
        type: "substitution",
        encrypted: "URYYB PNAQVQNGRF DHRFG CLGUBA",
        answer: "HELLO CANDIDATES QUEST PYTHON",
        timeLimit: 90,
        hint: "This is ROT13 (a special substitution). Each letter is shifted 13 positions: A→N, B→O, ... N→A, O→B, etc. Apply this to every letter."
    },
    {
        id: 9,
        title: "Master Challenge",
        description: "MULTI-LAYER ENCRYPTION! Step 1: Decode the Base64 message 'eHJs' to get a string. Step 2: Apply Caesar Cipher with shift 13 to that decoded string to get the key. Step 3: Use that key to decrypt the Vigenère cipher 'Mmnrip Weqdip'. This is a true master-level challenge!",
        type: "mixed",
        encrypted: "eHJs (Base64) → Decode → Apply Caesar Shift 13 → Use as Vigenère Key → Decrypt 'Mmnrip Weqdip'",
        answer: "CIPHER MASTER",
        timeLimit: 180,
        actualType: "multi-layer",
        hint: "STEP 1: Decode Base64 'eHJs' to get 'xrl'. STEP 2: Apply Caesar Cipher ROT13 to 'xrl' to get the key 'key'. STEP 3: Use keyword 'key' to decrypt Vigenère 'Mmnrip Weqdip' to get 'CIPHER MASTER'."
    }
];

// ============================================
// PAGE MANAGEMENT
// ============================================

function showPage(pageName) {
    // Hide all pages
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
    }
}

function returnToMain() {
    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // Reset state
    gameState.currentChallenge = null;
    gameState.hintShown = false;
    
    // Update and show main page
    updateMainPageStats();
    showPage('mainPage');
}

// ============================================
// MAIN PAGE - UPDATE STATS
// ============================================

function updateMainPageStats() {
    // Update score
    const scoreEl = document.getElementById('mainScore');
    if (scoreEl) scoreEl.textContent = gameState.score;
    
    // Update completed count
    const completedEl = document.getElementById('mainCompleted');
    if (completedEl) completedEl.textContent = `${gameState.completedChallenges.size}/10`;
    
    // Update level
    const completedCount = gameState.completedChallenges.size;
    let level = 'NOVICE';
    if (completedCount >= 7) level = 'MASTER';
    else if (completedCount >= 5) level = 'EXPERT';
    else if (completedCount >= 3) level = 'ADVANCED';
    else if (completedCount >= 1) level = 'INTERMEDIATE';
    
    const levelEl = document.getElementById('mainLevel');
    if (levelEl) levelEl.textContent = level;
    
    // Update progress bar
    const percentage = (completedCount / 10) * 100;
    const progressEl = document.getElementById('progressFill');
    if (progressEl) progressEl.style.width = percentage + '%';
    
    const percentEl = document.getElementById('completionPercent');
    if (percentEl) percentEl.textContent = Math.round(percentage) + '% COMPLETE';
    
    // Update challenge card statuses
    challenges.forEach((challenge, index) => {
        const statusEl = document.getElementById(`status${index}`);
        if (!statusEl) return;
        
        const card = statusEl.closest('.challenge-card');
        if (!card) return;
        
        // Remove all classes
        card.classList.remove('locked', 'unlocked', 'completed');
        statusEl.classList.remove('locked', 'unlocked', 'completed');
        
        if (gameState.completedChallenges.has(index)) {
            // Completed
            statusEl.innerHTML = '<i class="fas fa-check"></i> COMPLETED';
            statusEl.classList.add('completed');
            card.classList.add('completed');
        } else if (index === 0 || gameState.completedChallenges.has(index - 1)) {
            // Unlocked
            statusEl.innerHTML = '<i class="fas fa-play"></i> PLAY';
            statusEl.classList.add('unlocked');
            card.classList.add('unlocked');
        } else {
            // Locked
            statusEl.innerHTML = '<i class="fas fa-lock"></i> LOCKED';
            statusEl.classList.add('locked');
            card.classList.add('locked');
        }
    });
}

// ============================================
// CHALLENGE PAGE
// ============================================

function startChallenge(challengeIndex) {
    const challenge = challenges[challengeIndex];
    if (!challenge) return;
    
    gameState.currentChallenge = challenge;
    gameState.hintShown = false;
    
    // Update UI
    const titleEl = document.getElementById('challengeTitle');
    const descEl = document.getElementById('challengeDescription');
    const encryptedEl = document.getElementById('encryptedMessage');
    const hintEl = document.getElementById('hintText');
    const answerEl = document.getElementById('answerInput');
    const hintBtn = document.getElementById('hintBtn');
    
    if (titleEl) titleEl.textContent = challenge.title;
    if (descEl) descEl.textContent = challenge.description;
    if (encryptedEl) encryptedEl.textContent = challenge.encrypted;
    if (hintEl) {
        hintEl.textContent = challenge.hint;
        hintEl.style.display = 'none';
    }
    if (answerEl) {
        answerEl.value = '';
        answerEl.focus();
    }
    if (hintBtn) {
        hintBtn.disabled = false;
        hintBtn.style.opacity = '1';
    }
    
    // Start timer
    gameState.timeLeft = challenge.timeLimit;
    startTimer();
    
    // Show challenge page
    showPage('challengePage');
}

// ============================================
// CHALLENGE UNLOCK CHECK
// ============================================

function startChallengeIfUnlocked(challengeIndex) {
    const isUnlocked = challengeIndex === 0 || gameState.completedChallenges.has(challengeIndex - 1);
    
    if (!isUnlocked) {
        showLockedMessage();
        return;
    }
    
    startChallenge(challengeIndex);
}

function showLockedMessage() {
    const notification = document.createElement('div');
    notification.textContent = '🔒 CHALLENGE LOCKED - Complete previous levels first!';
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 110, 0.95);
        color: #00f0ff;
        padding: 25px 50px;
        border-radius: 10px;
        font-weight: bold;
        font-size: 1.2em;
        z-index: 5000;
        border: 3px solid #ff006e;
        box-shadow: 0 0 30px rgba(255, 0, 110, 0.8);
        font-family: 'Courier Prime', monospace;
        letter-spacing: 2px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// TIMER
// ============================================

function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
            timeOut();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timerDisplay');
    if (!timerEl) return;
    
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Change color when time is running out
    if (gameState.timeLeft <= 10) {
        timerEl.style.color = '#ff006e';
    } else {
        timerEl.style.color = '#00f0ff';
    }
}

function timeOut() {
    if (gameState.currentChallenge) {
        showResult(false, `Time's up! Try again.`, false);
    }
}

// ============================================
// HINT SYSTEM
// ============================================

function showHint() {
    const hintEl = document.getElementById('hintText');
    const hintBtn = document.getElementById('hintBtn');
    
    if (hintEl) hintEl.style.display = 'block';
    if (hintBtn) {
        hintBtn.disabled = true;
        hintBtn.style.opacity = '0.6';
    }
    
    gameState.hintShown = true;
}

// ============================================
// ANSWER SUBMISSION
// ============================================

function handleEnter(event) {
    if (event.key === 'Enter') submitAnswer();
}

function submitAnswer() {
    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    if (!gameState.currentChallenge) return;
    
    const answerEl = document.getElementById('answerInput');
    const userAnswer = answerEl ? answerEl.value.trim().toUpperCase() : '';
    const correctAnswer = gameState.currentChallenge.answer.toUpperCase();
    
    if (userAnswer === correctAnswer) {
        // CORRECT - Show answer and message
        const points = gameState.hintShown ? 5 : 10;
        gameState.score += points;
        gameState.completedChallenges.add(gameState.currentChallenge.id);
        
        const bonusMsg = gameState.hintShown ? '(Bonus reduced for using hint)' : '(Full bonus!)';
        showResult(true, `Correct! You earned ${points} points. ${bonusMsg}`, true);
        
        // CHECK IF ALL CHALLENGES ARE COMPLETED
        if (gameState.completedChallenges.size === 10) {
            // Schedule celebration video to play after result page
            setTimeout(() => {
                showCelebration();
            }, 3000); // Wait 3 seconds before showing celebration
        }
    } else {
        // INCORRECT - Don't show answer, only message
        showResult(false, `Incorrect. Try again or use the hint!`, false);
    }
}

// ============================================
// RESULT PAGE
// ============================================

function showResult(isCorrect, message, showAnswer) {
    const resultEl = document.getElementById('resultContent');
    if (!resultEl || !gameState.currentChallenge) return;
    
    const status = isCorrect ? 'success' : 'fail';
    const icon = isCorrect ? '✓ SUCCESS' : '✗ FAILED';
    
    // Build the result details - only show answer if correct
    let resultDetailsHTML = `
        <div class="result-status ${status}">
            ${icon}
        </div>
        <div class="result-message">${message}</div>
        <div class="result-details">
            <p><strong>Challenge:</strong> ${gameState.currentChallenge.title}</p>
            <p><strong>Encrypted:</strong> ${gameState.currentChallenge.encrypted}</p>
    `;
    
    // Only show the answer if the user got it correct
    if (showAnswer) {
        resultDetailsHTML += `<p><strong>Answer:</strong> ${gameState.currentChallenge.answer}</p>`;
    }
    
    resultDetailsHTML += `
            <p><strong>Your Score:</strong> ${gameState.score}</p>
            <p><strong>Completed:</strong> ${gameState.completedChallenges.size}/10</p>
        </div>
    `;
    
    resultEl.innerHTML = resultDetailsHTML;
    
    showPage('resultPage');
}

// ============================================
// CELEBRATION PAGE
// ============================================

function showCelebration() {
    const video = document.getElementById('celebrationVideo');
    if (video) {
        video.currentTime = 0; // Reset video to start
        video.play(); // Play the video
    }
    showPage('celebrationPage');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateMainPageStats();
});