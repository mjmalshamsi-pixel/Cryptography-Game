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
    hintShown: false,
    hintPoints: 10          // ← NEW: Total hint points pool
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
        hintCost: 1,        // ← NEW: Costs 1 hint point
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
        hintCost: 1,        // ← NEW: Costs 1 hint point
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
        hintCost: 1,        // ← NEW: Costs 1 hint point
        hint: "Shift each letter backward by 5 positions in the alphabet. M→H, J→E, etc."
    },
    {
        id: 3,
        title: "Substitution Code",
        description: "Decrypt using the Atbash Cipher, where A↔Z, B↔Y, C↔X, etc. The alphabet is completely reversed.",
        type: "substitution",
        encrypted: "svool dliow",
        answer: "HELLO WORLD",
        timeLimit: 80,
        hintCost: 1,        // ← NEW: Costs 1 hint point
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
        hintCost: 1,        // ← NEW: Costs 1 hint point
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
        hintCost: 1,        // ← NEW: Costs 1 hint point
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
        hintCost: 1,        // ← NEW: Costs 1 hint point
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
        hintCost: 1,        // ← NEW: Costs 1 hint point
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
        hintCost: 1,        // ← NEW: Costs 1 hint point
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
        hintCost: 5,        // ← NEW: Costs 5 hint points (Master Challenge)
        hint: "STEP 1: Decode Base64 'eHJs' to get 'xrl'. STEP 2: Apply Caesar Cipher ROT13 to 'xrl' to get the key 'key'. STEP 3: Use keyword 'key' to decrypt Vigenère 'Mmnrip Weqdip' to get 'CIPHER MASTER'."
    }
];

// ============================================
// PAGE MANAGEMENT
// ============================================

function showPage(pageName) {
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => page.classList.remove('active'));
    
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
    }
}

function returnToMain() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    gameState.currentChallenge = null;
    gameState.hintShown = false;
    
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
    
    // Update hint points display on main page
    const mainHintEl = document.getElementById('mainHintPoints');
    if (mainHintEl) mainHintEl.textContent = gameState.hintPoints;

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
        
        card.classList.remove('locked', 'unlocked', 'completed');
        statusEl.classList.remove('locked', 'unlocked', 'completed');
        
        if (gameState.completedChallenges.has(index)) {
            statusEl.innerHTML = '<i class="fas fa-check"></i> COMPLETED';
            statusEl.classList.add('completed');
            card.classList.add('completed');
        } else if (index === 0 || gameState.completedChallenges.has(index - 1)) {
            statusEl.innerHTML = '<i class="fas fa-play"></i> PLAY';
            statusEl.classList.add('unlocked');
            card.classList.add('unlocked');
        } else {
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
    
    const titleEl      = document.getElementById('challengeTitle');
    const descEl       = document.getElementById('challengeDescription');
    const encryptedEl  = document.getElementById('encryptedMessage');
    const hintEl       = document.getElementById('hintText');
    const answerEl     = document.getElementById('answerInput');
    const hintBtn      = document.getElementById('hintBtn');
    
    if (titleEl)     titleEl.textContent     = challenge.title;
    if (descEl)      descEl.textContent      = challenge.description;
    if (encryptedEl) encryptedEl.textContent = challenge.encrypted;
    if (hintEl) {
        hintEl.textContent   = challenge.hint;
        hintEl.style.display = 'none';
    }
    if (answerEl) {
        answerEl.value = '';
        answerEl.focus();
    }

    // ── NEW: Refresh hint button state based on current hint points ──
    updateHintButton();
    
    // Start timer
    gameState.timeLeft = challenge.timeLimit;
    startTimer();
    
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
        notification.style.opacity    = '0';
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
    const seconds  = gameState.timeLeft % 60;
    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    timerEl.style.color = gameState.timeLeft <= 10 ? '#ff006e' : '#00f0ff';
}

function timeOut() {
    if (gameState.currentChallenge) {
        showResult(false, `Time's up! Try again.`, false);
    }
}

// ============================================
// HINT SYSTEM  ← FULLY UPDATED
// ============================================

/**
 * Refreshes the hint button's appearance and tooltip based on
 * the player's remaining hint points and the current challenge's cost.
 */
function updateHintButton() {
    const hintBtn  = document.getElementById('hintBtn');
    const hintCostEl = document.getElementById('hintCost');
    if (!hintBtn || !gameState.currentChallenge) return;

    const cost          = gameState.currentChallenge.hintCost;
    const canAfford     = gameState.hintPoints >= cost;
    const alreadyShown  = gameState.hintShown;

    // Update the inline cost badge inside the button
    if (hintCostEl) hintCostEl.textContent = `-${cost} PT${cost > 1 ? 'S' : ''}`;

    if (alreadyShown || !canAfford) {
        hintBtn.disabled      = true;
        hintBtn.style.opacity = '0.45';
        hintBtn.title = alreadyShown
            ? 'Hint already used for this challenge'
            : `Not enough hint points! Need ${cost}, have ${gameState.hintPoints}`;
    } else {
        hintBtn.disabled      = false;
        hintBtn.style.opacity = '1';
        hintBtn.title = `Use hint (costs ${cost} hint point${cost > 1 ? 's' : ''})`;
    }

    // Keep the challenge-page hint-points counter in sync
    updateChallengeHintDisplay();
}

/**
 * Updates the hint-points counter visible on the challenge page.
 */
function updateChallengeHintDisplay() {
    const hpEl    = document.getElementById('challengeHintPoints');
    const hpBar   = document.getElementById('hintPointsBar');

    if (hpEl)  hpEl.textContent = gameState.hintPoints;

    if (hpBar) {
        const pct = (gameState.hintPoints / 10) * 100;
        hpBar.style.width = pct + '%';

        // Colour the bar: green → yellow → red
        if (gameState.hintPoints >= 6) {
            hpBar.style.background = 'linear-gradient(90deg, #00ff41, #00f0ff)';
        } else if (gameState.hintPoints >= 3) {
            hpBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff6600)';
        } else {
            hpBar.style.background = 'linear-gradient(90deg, #ff006e, #ff003a)';
        }
    }
}

/**
 * Called when the player clicks SHOW HINT.
 * Deducts hint points and reveals the hint text.
 */
function showHint() {
    if (!gameState.currentChallenge) return;

    const cost = gameState.currentChallenge.hintCost;

    // Guard: not enough points
    if (gameState.hintPoints < cost) {
        showNotEnoughPointsWarning(cost);
        return;
    }

    // Deduct points
    gameState.hintPoints -= cost;

    // Reveal hint text
    const hintEl = document.getElementById('hintText');
    if (hintEl) hintEl.style.display = 'block';

    gameState.hintShown = true;

    // Refresh button + counter
    updateHintButton();

    // Show a brief floating confirmation
    showHintDeductionToast(cost);
}

/**
 * Shows a temporary on-screen toast when hint points are deducted.
 */
function showHintDeductionToast(cost) {
    const toast = document.createElement('div');
    toast.textContent = `💡 -${cost} Hint Point${cost > 1 ? 's' : ''} used!`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(181, 55, 242, 0.92);
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Courier Prime', monospace;
        font-size: 0.95em;
        letter-spacing: 1px;
        z-index: 6000;
        border: 2px solid #b537f2;
        box-shadow: 0 0 20px rgba(181, 55, 242, 0.7);
        animation: fadeInDown 0.3s ease-out;
        pointer-events: none;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease-out';
        toast.style.opacity    = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

/**
 * Shows a warning toast when the player cannot afford the hint.
 */
function showNotEnoughPointsWarning(cost) {
    const toast = document.createElement('div');
    toast.textContent = `⚠️ Need ${cost} hint point${cost > 1 ? 's' : ''}! You only have ${gameState.hintPoints}.`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 0, 110, 0.92);
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Courier Prime', monospace;
        font-size: 0.95em;
        letter-spacing: 1px;
        z-index: 6000;
        border: 2px solid #ff006e;
        box-shadow: 0 0 20px rgba(255, 0, 110, 0.7);
        pointer-events: none;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease-out';
        toast.style.opacity    = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ============================================
// ANSWER SUBMISSION
// ============================================

function handleEnter(event) {
    if (event.key === 'Enter') submitAnswer();
}

function submitAnswer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    if (!gameState.currentChallenge) return;
    
    const answerEl   = document.getElementById('answerInput');
    const userAnswer = answerEl ? answerEl.value.trim().toUpperCase() : '';
    const correctAnswer = gameState.currentChallenge.answer.toUpperCase();
    
    if (userAnswer === correctAnswer) {
        const points   = gameState.hintShown ? 5 : 10;
        gameState.score += points;
        gameState.completedChallenges.add(gameState.currentChallenge.id);
        
        const bonusMsg = gameState.hintShown
            ? '(Bonus reduced for using hint)'
            : '(Full bonus!)';
        showResult(true, `Correct! You earned ${points} points. ${bonusMsg}`, true);
        
        if (gameState.completedChallenges.size === 10) {
            setTimeout(() => { showCelebration(); }, 3000);
        }
    } else {
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
    const icon   = isCorrect ? '✓ SUCCESS' : '✗ FAILED';
    
    let resultDetailsHTML = `
        <div class="result-status ${status}">${icon}</div>
        <div class="result-message">${message}</div>
        <div class="result-details">
            <p><strong>Challenge:</strong> ${gameState.currentChallenge.title}</p>
            <p><strong>Encrypted:</strong> ${gameState.currentChallenge.encrypted}</p>
    `;
    
    if (showAnswer) {
        resultDetailsHTML += `<p><strong>Answer:</strong> ${gameState.currentChallenge.answer}</p>`;
    }
    
    // ── NEW: Show remaining hint points on result page ──
    resultDetailsHTML += `
            <p><strong>Your Score:</strong> ${gameState.score}</p>
            <p><strong>Completed:</strong> ${gameState.completedChallenges.size}/10</p>
            <p><strong>Hint Points Remaining:</strong>
               <span class="hint-points-result">${gameState.hintPoints} / 10</span>
            </p>
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
        video.currentTime = 0;
        video.play();
    }
    showPage('celebrationPage');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateMainPageStats();
});
