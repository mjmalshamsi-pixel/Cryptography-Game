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
    hintPoints: 10,
    playerName: ''          // ← NEW: stores contestant name for certificate
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
        hintCost: 1,
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
        hintCost: 1,
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
        hintCost: 1,
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
        hintCost: 1,
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
        hintCost: 1,
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
        hintCost: 1,
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
        hintCost: 1,
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
        hintCost: 1,
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
        hintCost: 1,
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
        hintCost: 5,
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
    if (page) page.classList.add('active');
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
    const scoreEl = document.getElementById('mainScore');
    if (scoreEl) scoreEl.textContent = gameState.score;

    const completedEl = document.getElementById('mainCompleted');
    if (completedEl) completedEl.textContent = `${gameState.completedChallenges.size}/10`;

    const mainHintEl = document.getElementById('mainHintPoints');
    if (mainHintEl) mainHintEl.textContent = gameState.hintPoints;

    const completedCount = gameState.completedChallenges.size;
    let level = 'NOVICE';
    if (completedCount >= 7)      level = 'MASTER';
    else if (completedCount >= 5) level = 'EXPERT';
    else if (completedCount >= 3) level = 'ADVANCED';
    else if (completedCount >= 1) level = 'INTERMEDIATE';

    const levelEl = document.getElementById('mainLevel');
    if (levelEl) levelEl.textContent = level;

    const percentage = (completedCount / 10) * 100;
    const progressEl = document.getElementById('progressFill');
    if (progressEl) progressEl.style.width = percentage + '%';

    const percentEl = document.getElementById('completionPercent');
    if (percentEl) percentEl.textContent = Math.round(percentage) + '% COMPLETE';

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

    const titleEl     = document.getElementById('challengeTitle');
    const descEl      = document.getElementById('challengeDescription');
    const encryptedEl = document.getElementById('encryptedMessage');
    const hintEl      = document.getElementById('hintText');
    const answerEl    = document.getElementById('answerInput');

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

    updateHintButton();
    gameState.timeLeft = challenge.timeLimit;
    startTimer();
    showPage('challengePage');
}

// ============================================
// CHALLENGE UNLOCK CHECK
// ============================================

function startChallengeIfUnlocked(challengeIndex) {
    const isUnlocked = challengeIndex === 0 || gameState.completedChallenges.has(challengeIndex - 1);
    if (!isUnlocked) { showLockedMessage(); return; }
    startChallenge(challengeIndex);
}

function showLockedMessage() {
    const notification = document.createElement('div');
    notification.textContent = '🔒 CHALLENGE LOCKED - Complete previous levels first!';
    notification.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255,0,110,0.95); color: #00f0ff;
        padding: 25px 50px; border-radius: 10px;
        font-weight: bold; font-size: 1.2em; z-index: 5000;
        border: 3px solid #ff006e;
        box-shadow: 0 0 30px rgba(255,0,110,0.8);
        font-family: 'Courier Prime', monospace; letter-spacing: 2px;
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
    timerEl.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    timerEl.style.color = gameState.timeLeft <= 10 ? '#ff006e' : '#00f0ff';
}

function timeOut() {
    if (gameState.currentChallenge) showResult(false, `Time's up! Try again.`, false);
}

// ============================================
// HINT SYSTEM
// ============================================

function updateHintButton() {
    const hintBtn    = document.getElementById('hintBtn');
    const hintCostEl = document.getElementById('hintCost');
    if (!hintBtn || !gameState.currentChallenge) return;

    const cost         = gameState.currentChallenge.hintCost;
    const canAfford    = gameState.hintPoints >= cost;
    const alreadyShown = gameState.hintShown;

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
    updateChallengeHintDisplay();
}

function updateChallengeHintDisplay() {
    const hpEl  = document.getElementById('challengeHintPoints');
    const hpBar = document.getElementById('hintPointsBar');
    if (hpEl)  hpEl.textContent = gameState.hintPoints;
    if (hpBar) {
        const pct = (gameState.hintPoints / 10) * 100;
        hpBar.style.width = pct + '%';
        if (gameState.hintPoints >= 6)      hpBar.style.background = 'linear-gradient(90deg,#00ff41,#00f0ff)';
        else if (gameState.hintPoints >= 3) hpBar.style.background = 'linear-gradient(90deg,#ffaa00,#ff6600)';
        else                                hpBar.style.background = 'linear-gradient(90deg,#ff006e,#ff003a)';
    }
}

function showHint() {
    if (!gameState.currentChallenge) return;
    const cost = gameState.currentChallenge.hintCost;
    if (gameState.hintPoints < cost) { showNotEnoughPointsWarning(cost); return; }
    gameState.hintPoints -= cost;
    const hintEl = document.getElementById('hintText');
    if (hintEl) hintEl.style.display = 'block';
    gameState.hintShown = true;
    updateHintButton();
    showHintDeductionToast(cost);
}

function showHintDeductionToast(cost) {
    const toast = document.createElement('div');
    toast.textContent = `💡 -${cost} Hint Point${cost > 1 ? 's' : ''} used!`;
    toast.style.cssText = `
        position:fixed; top:20px; right:20px;
        background:rgba(181,55,242,0.92); color:#fff;
        padding:12px 24px; border-radius:8px;
        font-family:'Courier Prime',monospace; font-size:0.95em;
        letter-spacing:1px; z-index:6000;
        border:2px solid #b537f2;
        box-shadow:0 0 20px rgba(181,55,242,0.7);
        pointer-events:none;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease-out';
        toast.style.opacity    = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

function showNotEnoughPointsWarning(cost) {
    const toast = document.createElement('div');
    toast.textContent = `⚠️ Need ${cost} hint point${cost > 1 ? 's' : ''}! You only have ${gameState.hintPoints}.`;
    toast.style.cssText = `
        position:fixed; top:20px; right:20px;
        background:rgba(255,0,110,0.92); color:#fff;
        padding:12px 24px; border-radius:8px;
        font-family:'Courier Prime',monospace; font-size:0.95em;
        letter-spacing:1px; z-index:6000;
        border:2px solid #ff006e;
        box-shadow:0 0 20px rgba(255,0,110,0.7);
        pointer-events:none;
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

    const answerEl      = document.getElementById('answerInput');
    const userAnswer    = answerEl ? answerEl.value.trim().toUpperCase() : '';
    const correctAnswer = gameState.currentChallenge.answer.toUpperCase();

    if (userAnswer === correctAnswer) {
        const points   = gameState.hintShown ? 5 : 10;
        gameState.score += points;
        gameState.completedChallenges.add(gameState.currentChallenge.id);
        const bonusMsg = gameState.hintShown
            ? '(Bonus reduced for using hint)'
            : '(Full bonus!)';
        showResult(true, `Correct! You earned ${points} points. ${bonusMsg}`, true);

        // ── All 10 challenges done → show celebration then name modal ──
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

    let html = `
        <div class="result-status ${status}">${icon}</div>
        <div class="result-message">${message}</div>
        <div class="result-details">
            <p><strong>Challenge:</strong> ${gameState.currentChallenge.title}</p>
            <p><strong>Encrypted:</strong> ${gameState.currentChallenge.encrypted}</p>
    `;
    if (showAnswer) {
        html += `<p><strong>Answer:</strong> ${gameState.currentChallenge.answer}</p>`;
    }
    html += `
            <p><strong>Your Score:</strong> ${gameState.score}</p>
            <p><strong>Completed:</strong> ${gameState.completedChallenges.size}/10</p>
            <p><strong>Hint Points Remaining:</strong>
               <span class="hint-points-result">${gameState.hintPoints} / 10</span>
            </p>
        </div>
    `;
    resultEl.innerHTML = html;
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

    // ── After video ends, show the name modal automatically ──
    if (video) {
        video.addEventListener('ended', () => {
            showNameModal();
        }, { once: true });
    }
}

// ============================================
// NAME MODAL  ← NEW
// ============================================

function showNameModal() {
    const modal = document.getElementById('nameModal');
    if (!modal) return;
    modal.classList.add('active');

    // Focus the input after transition
    setTimeout(() => {
        const input = document.getElementById('playerNameInput');
        if (input) input.focus();
    }, 400);
}

function closeNameModal() {
    const modal = document.getElementById('nameModal');
    if (modal) modal.classList.remove('active');
}

function handleNameEnter(event) {
    if (event.key === 'Enter') confirmPlayerName();
}

function confirmPlayerName() {
    const input = document.getElementById('playerNameInput');
    const name  = input ? input.value.trim() : '';

    if (!name) {
        // Shake the input to signal error
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 600);
        showNameError('Please enter your name to generate your certificate!');
        return;
    }

    if (name.length < 2) {
        showNameError('Name must be at least 2 characters!');
        return;
    }

    if (name.length > 40) {
        showNameError('Name must be 40 characters or fewer!');
        return;
    }

    gameState.playerName = name;
    closeNameModal();

    // Small delay then generate + show certificate
    setTimeout(() => {
        generateCertificate(name);
        showPage('certificatePage');
    }, 300);
}

function showNameError(msg) {
    const errEl = document.getElementById('nameError');
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.style.display = 'block';
    setTimeout(() => { errEl.style.display = 'none'; }, 3500);
}

// ============================================
// CERTIFICATE GENERATOR  ← NEW
// ============================================

function generateCertificate(name) {
    const canvas = document.getElementById('certificateCanvas');
    if (!canvas) return;

    const W = 1200;
    const H = 800;
    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');

    // ── 1. Deep dark background ──
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0,   '#060919');
    bgGrad.addColorStop(0.5, '#0d1230');
    bgGrad.addColorStop(1,   '#060919');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── 2. Subtle grid lines ──
    ctx.strokeStyle = 'rgba(0,240,255,0.04)';
    ctx.lineWidth   = 1;
    for (let x = 0; x <= W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── 3. Corner bracket decorations ──
    const bracketSize = 50;
    const bracketGap  = 30;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth   = 3;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(bracketGap + bracketSize, bracketGap);
    ctx.lineTo(bracketGap, bracketGap);
    ctx.lineTo(bracketGap, bracketGap + bracketSize);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(W - bracketGap - bracketSize, bracketGap);
    ctx.lineTo(W - bracketGap, bracketGap);
    ctx.lineTo(W - bracketGap, bracketGap + bracketSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(bracketGap + bracketSize, H - bracketGap);
    ctx.lineTo(bracketGap, H - bracketGap);
    ctx.lineTo(bracketGap, H - bracketGap - bracketSize);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(W - bracketGap - bracketSize, H - bracketGap);
    ctx.lineTo(W - bracketGap, H - bracketGap);
    ctx.lineTo(W - bracketGap, H - bracketGap - bracketSize);
    ctx.stroke();

    // ── 4. Outer neon border ──
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth   = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur  = 18;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.shadowBlur  = 0;

    // Inner accent border (purple)
    ctx.strokeStyle = 'rgba(181,55,242,0.5)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // ── 5. Top decorative bar ──
    const topBar = ctx.createLinearGradient(0, 0, W, 0);
    topBar.addColorStop(0,   'transparent');
    topBar.addColorStop(0.3, 'rgba(0,240,255,0.15)');
    topBar.addColorStop(0.7, 'rgba(0,240,255,0.15)');
    topBar.addColorStop(1,   'transparent');
    ctx.fillStyle = topBar;
    ctx.fillRect(0, 65, W, 3);

    // Bottom decorative bar
    ctx.fillRect(0, H - 68, W, 3);

    // ── 6. Hex decoration dots ──
    const dotPositions = [
        [60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60],
        [W / 2, 50], [W / 2, H - 50]
    ];
    dotPositions.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur  = 12;
        ctx.fill();
        ctx.shadowBlur  = 0;
    });

    // ── 7. "CIPHER MASTER" header logo text ──
    ctx.font      = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur  = 10;
    ctx.textAlign = 'center';
    ctx.fillText('[ CIPHER MASTER — HACKER CHALLENGE ]', W / 2, 55);
    ctx.shadowBlur  = 0;

    // ── 8. "CERTIFICATE OF COMPLETION" title ──
    ctx.font        = 'bold 46px "Courier New", monospace';
    ctx.fillStyle   = '#ffffff';
    ctx.shadowColor = '#b537f2';
    ctx.shadowBlur  = 22;
    ctx.textAlign   = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 145);
    ctx.shadowBlur  = 0;

    // Underline the title
    const titleWidth = ctx.measureText('CERTIFICATE OF COMPLETION').width;
    const titleUlX   = W / 2 - titleWidth / 2;
    const ulGrad = ctx.createLinearGradient(titleUlX, 0, titleUlX + titleWidth, 0);
    ulGrad.addColorStop(0,   '#b537f2');
    ulGrad.addColorStop(0.5, '#00f0ff');
    ulGrad.addColorStop(1,   '#b537f2');
    ctx.strokeStyle = ulGrad;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(titleUlX, 155);
    ctx.lineTo(titleUlX + titleWidth, 155);
    ctx.stroke();

    // ── 9. "This is to certify that" label ──
    ctx.font      = '20px "Courier New", monospace';
    ctx.fillStyle = 'rgba(0,240,255,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('THIS IS TO CERTIFY THAT', W / 2, 220);

    // ── 10. Player name — the hero element ──
    // Dynamic font sizing to fit long names
    let nameFontSize = 68;
    ctx.font = `bold ${nameFontSize}px "Courier New", monospace`;
    while (ctx.measureText(name.toUpperCase()).width > W - 160 && nameFontSize > 28) {
        nameFontSize -= 2;
        ctx.font = `bold ${nameFontSize}px "Courier New", monospace`;
    }

    // Name glow shadow layers
    const nameY = 305;
    ['rgba(0,240,255,0.15)', 'rgba(0,240,255,0.3)', '#00f0ff'].forEach((col, i) => {
        ctx.shadowColor = col;
        ctx.shadowBlur  = [30, 18, 8][i];
        ctx.fillStyle   = i < 2 ? col : '#00ffcc';
        ctx.textAlign   = 'center';
        ctx.fillText(name.toUpperCase(), W / 2, nameY);
    });
    ctx.shadowBlur = 0;

    // Name underline gradient
    const nameWidth = ctx.measureText(name.toUpperCase()).width;
    const nameUlX   = W / 2 - nameWidth / 2;
    const nameGrad  = ctx.createLinearGradient(nameUlX, 0, nameUlX + nameWidth, 0);
    nameGrad.addColorStop(0,   'transparent');
    nameGrad.addColorStop(0.2, '#00f0ff');
    nameGrad.addColorStop(0.8, '#00f0ff');
    nameGrad.addColorStop(1,   'transparent');
    ctx.strokeStyle = nameGrad;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(nameUlX, nameY + 12);
    ctx.lineTo(nameUlX + nameWidth, nameY + 12);
    ctx.stroke();

    // ── 11. "has successfully completed" label ──
    ctx.font      = '20px "Courier New", monospace';
    ctx.fillStyle = 'rgba(0,240,255,0.7)';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.fillText('HAS SUCCESSFULLY COMPLETED ALL 10 CIPHER CHALLENGES', W / 2, 365);

    // ── 12. Stats row ──
    const statsY    = 450;
    const statsData = [
        { label: 'FINAL SCORE',   value: `${gameState.score} PTS`,       color: '#00ff41' },
        { label: 'RANK',          value: getFinalRank(),                  color: '#b537f2' },
        { label: 'HINT POINTS',   value: `${gameState.hintPoints} / 10`, color: '#ffaa00' },
        { label: 'DATE',          value: getFormattedDate(),             color: '#00f0ff' }
    ];

    const statBoxW = 220;
    const statBoxH = 80;
    const statGap  = 30;
    const totalW   = statsData.length * statBoxW + (statsData.length - 1) * statGap;
    const startX   = W / 2 - totalW / 2;

    statsData.forEach((stat, i) => {
        const bx = startX + i * (statBoxW + statGap);
        const by = statsY;

        // Box background
        ctx.fillStyle = 'rgba(0,240,255,0.05)';
        ctx.fillRect(bx, by, statBoxW, statBoxH);

        // Box border
        ctx.strokeStyle = stat.color;
        ctx.lineWidth   = 1.5;
        ctx.shadowColor = stat.color;
        ctx.shadowBlur  = 8;
        ctx.strokeRect(bx, by, statBoxW, statBoxH);
        ctx.shadowBlur  = 0;

        // Label
        ctx.font      = '11px "Courier New", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(stat.label, bx + statBoxW / 2, by + 22);

        // Value
        ctx.font        = `bold 22px "Courier New", monospace`;
        ctx.fillStyle   = stat.color;
        ctx.shadowColor = stat.color;
        ctx.shadowBlur  = 10;
        ctx.fillText(stat.value, bx + statBoxW / 2, by + 56);
        ctx.shadowBlur  = 0;
    });

    // ── 13. Achievement badge row ──
    const badgeY    = 575;
    const badgeText = getAchievementBadges();
    ctx.font      = '13px "Courier New", monospace';
    ctx.fillStyle = 'rgba(0,240,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('ACHIEVEMENTS UNLOCKED:', W / 2, badgeY);

    ctx.font      = 'bold 15px "Courier New", monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur  = 8;
    ctx.fillText(badgeText, W / 2, badgeY + 26);
    ctx.shadowBlur  = 0;

    // ── 14. Bottom signature line ──
    ctx.font      = '13px "Courier New", monospace';
    ctx.fillStyle = 'rgba(0,240,255,0.4)';
    ctx.textAlign = 'left';
    ctx.fillText('VERIFIED BY: CIPHER MASTER SYSTEM v1.0', 60, H - 50);

    ctx.textAlign = 'right';
    ctx.fillText(`CHALLENGE ID: CM-${generateCertID()}`, W - 60, H - 50);

    // ── 15. Watermark ──
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.font        = 'bold 160px "Courier New", monospace';
    ctx.fillStyle   = '#00f0ff';
    ctx.textAlign   = 'center';
    ctx.translate(W / 2, H / 2 + 40);
    ctx.rotate(-0.2);
    ctx.fillText('CIPHER', 0, 0);
    ctx.restore();
}

// ── Helper: determine final rank from score ──
function getFinalRank() {
    const s = gameState.score;
    if (s >= 95)      return 'ELITE HACKER';
    if (s >= 80)      return 'CYBER MASTER';
    if (s >= 65)      return 'CRYPTO EXPERT';
    if (s >= 50)      return 'CODE BREAKER';
    return               'CIPHER AGENT';
}

// ── Helper: achievement badge string ──
function getAchievementBadges() {
    const badges = ['🏆 CIPHER MASTER'];
    if (gameState.score >= 100)        badges.push('⭐ PERFECT SCORE');
    if (gameState.hintPoints === 10)   badges.push('🧠 NO HINTS NEEDED');
    else if (gameState.hintPoints >= 7) badges.push('💡 HINT SAVER');
    if (gameState.score >= 90)         badges.push('🔥 NEAR FLAWLESS');
    return badges.join('   ');
}

// ── Helper: formatted date ──
function getFormattedDate() {
    const now = new Date();
    const dd  = String(now.getDate()).padStart(2, '0');
    const mm  = String(now.getMonth() + 1).padStart(2, '0');
    const yy  = now.getFullYear();
    return `${dd}/${mm}/${yy}`;
}

// ── Helper: short unique cert ID ──
function generateCertID() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── Download certificate as PNG ──
function downloadCertificate() {
    const canvas = document.getElementById('certificateCanvas');
    if (!canvas) return;
    const link    = document.createElement('a');
    link.download = `CipherMaster_Certificate_${gameState.playerName.replace(/\s+g/, '_')}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateMainPageStats();
});
