// ============================================
// CRYPTOGRAPHY GAME - MAIN GAME LOGIC
// ============================================

const gameState = {
    currentChallenge: null,
    score: 0,
    completedChallenges: new Set(),
    timeLeft: 0,
    timerInterval: null,
    hintShown: false,
    hintPoints: 10,
    playerName: '',
    gifFreezeTimer: null        // ← tracks the GIF freeze timeout
};

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
        hint: "In Atbash, each letter maps to its opposite: A=Z, B=Y, C=X, D=W, E=V, F=U, G=T, H=S, etc."
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
        hint: "Use the keyword CIPHER repeated. C=2, I=8, P=15, H=7, E=4, R=17."
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
        hint: "Decode using the Base64 alphabet. Each character represents 6 bits of data."
    },
    {
        id: 6,
        title: "Caesar Mixed",
        description: "Decrypt this Caesar Cipher. The shift value is unknown — try all 26 possible shifts.",
        type: "caesar",
        encrypted: "KHOOR",
        answer: "HELLO",
        timeLimit: 60,
        shift: 3,
        hintCost: 1,
        hint: "Try shift values from 1 to 25. When you get readable words, you found the right shift!"
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
        hint: "S=18, E=4, C=2, R=17, E=4, T=19. Repeat: S.E.C.R.E.T.S.E.C.R.E.T.S"
    },
    {
        id: 8,
        title: "Substitution Hard",
        description: "Decrypt using ROT13 cipher. Each letter is rotated 13 positions. (A→N, B→O, etc.)",
        type: "substitution",
        encrypted: "URYYB PNAQVQNGRF DHRFG CLGUBA",
        answer: "HELLO CANDIDATES QUEST PYTHON",
        timeLimit: 90,
        hintCost: 1,
        hint: "ROT13: A→N, B→O ... N→A, O→B. Apply to every letter."
    },
    {
        id: 9,
        title: "Master Challenge",
        description: "MULTI-LAYER ENCRYPTION! Step 1: Decode Base64 'eHJs'. Step 2: Apply Caesar shift 13 to get the key. Step 3: Use that key to decrypt Vigenère 'Mmnrip Weqdip'.",
        type: "mixed",
        encrypted: "eHJs (Base64) → Decode → Caesar Shift 13 → Vigenère Key → Decrypt 'Mmnrip Weqdip'",
        answer: "CIPHER MASTER",
        timeLimit: 180,
        actualType: "multi-layer",
        hintCost: 5,
        hint: "STEP 1: Base64 'eHJs' = 'xrl'. STEP 2: ROT13 'xrl' = 'key'. STEP 3: Vigenère 'Mmnrip Weqdip' with key 'key' = 'CIPHER MASTER'."
    }
];

// ============================================
// PAGE MANAGEMENT
// ============================================

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageName);
    if (page) page.classList.add('active');
}

function returnToMain() {
    // Clear challenge timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }

    // Clear GIF freeze timer if going back from celebration
    if (gameState.gifFreezeTimer) {
        clearTimeout(gameState.gifFreezeTimer);
        gameState.gifFreezeTimer = null;
    }

    // Restore GIF element if it was frozen/hidden
    const gif = document.getElementById('celebrationGif');
    if (gif) gif.style.display = 'block';

    // Remove any frozen canvas left over from previous visit
    const frozenCanvas = document.getElementById('frozenGifCanvas');
    if (frozenCanvas) frozenCanvas.remove();

    gameState.currentChallenge = null;
    gameState.hintShown        = false;

    updateMainPageStats();
    showPage('mainPage');
}

// ============================================
// MAIN PAGE STATS
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
    if      (completedCount >= 7) level = 'MASTER';
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
    gameState.hintShown        = false;

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

function startChallengeIfUnlocked(challengeIndex) {
    const isUnlocked = challengeIndex === 0 ||
                       gameState.completedChallenges.has(challengeIndex - 1);
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
        notification.style.transition = 'opacity 0.5s ease-out';
        notification.style.opacity    = '0';
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
    timerEl.textContent =
        `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    timerEl.style.color = gameState.timeLeft <= 10 ? '#ff006e' : '#00f0ff';
}

function timeOut() {
    if (gameState.currentChallenge) showResult(false, `Time's up! Try again.`, false, false);
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
            ? 'Hint already used'
            : `Need ${cost} pts, you have ${gameState.hintPoints}`;
    } else {
        hintBtn.disabled      = false;
        hintBtn.style.opacity = '1';
        hintBtn.title = `Costs ${cost} hint point${cost > 1 ? 's' : ''}`;
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
        if      (gameState.hintPoints >= 6) hpBar.style.background = 'linear-gradient(90deg,#00ff41,#00f0ff)';
        else if (gameState.hintPoints >= 3) hpBar.style.background = 'linear-gradient(90deg,#ffaa00,#ff6600)';
        else                                hpBar.style.background = 'linear-gradient(90deg,#ff006e,#ff003a)';
    }
}

function showHint() {
    if (!gameState.currentChallenge) return;
    const cost = gameState.currentChallenge.hintCost;
    if (gameState.hintPoints < cost) {
        showToast(`⚠️ Need ${cost} pts! You have ${gameState.hintPoints}.`, '#ff006e');
        return;
    }
    gameState.hintPoints -= cost;
    const hintEl = document.getElementById('hintText');
    if (hintEl) hintEl.style.display = 'block';
    gameState.hintShown = true;
    updateHintButton();
    showToast(`💡 -${cost} Hint Point${cost > 1 ? 's' : ''} used!`, '#b537f2');
}

function showToast(message, color) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: ${color}ee; color: #fff;
        padding: 12px 24px; border-radius: 8px;
        font-family: 'Courier Prime', monospace;
        font-size: 0.95em; letter-spacing: 1px;
        z-index: 6000; border: 2px solid ${color};
        box-shadow: 0 0 20px ${color}99;
        pointer-events: none;
        transition: opacity 0.5s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2500);
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

    const answerEl         = document.getElementById('answerInput');
    const userAnswer       = answerEl ? answerEl.value.trim().toUpperCase() : '';
    const correctAnswer    = gameState.currentChallenge.answer.toUpperCase();
    const isFinalChallenge = gameState.currentChallenge.id === 9;

    if (userAnswer === correctAnswer) {
        const points   = gameState.hintShown ? 5 : 10;
        gameState.score += points;
        gameState.completedChallenges.add(gameState.currentChallenge.id);
        const bonusMsg = gameState.hintShown
            ? '(Bonus reduced for using hint)'
            : '(Full bonus!)';
        showResult(true, `Correct! You earned ${points} points. ${bonusMsg}`, true, isFinalChallenge);
    } else {
        showResult(false, `Incorrect. Try again or use the hint!`, false, false);
    }
}

// ============================================
// RESULT PAGE
// ============================================

function showResult(isCorrect, message, showAnswer, isFinal) {
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

    // ── Action buttons ──
    const actionsEl = document.getElementById('resultActions');
    if (actionsEl) {
        if (isFinal && isCorrect) {
            actionsEl.innerHTML = `
                <div class="final-result-actions">
                    <p class="final-congrats-text">
                        <i class="fas fa-star"></i>
                        ALL 10 CHALLENGES COMPLETE!
                        <i class="fas fa-star"></i>
                    </p>
                    <div class="final-buttons-row">
                        <button class="btn-watch-video" onclick="showCelebration()">
                            <i class="fas fa-play-circle"></i> WATCH CELEBRATION
                        </button>
                        <button class="btn-claim-cert" onclick="showNamePage()">
                            <i class="fas fa-certificate"></i> CLAIM CERTIFICATE
                        </button>
                    </div>
                </div>
            `;
        } else {
            actionsEl.innerHTML = `
                <button class="btn-next" onclick="returnToMain()">
                    <i class="fas fa-arrow-right"></i> BACK TO MAIN
                </button>
            `;
        }
    }

    showPage('resultPage');
}

// ============================================
// CELEBRATION PAGE
// ============================================

function showCelebration() {
    showPage('celebrationPage');

    const gif = document.getElementById('celebrationGif');
    if (!gif) return;

    // ── Clean up any previous freeze ──
    const oldCanvas = document.getElementById('frozenGifCanvas');
    if (oldCanvas) oldCanvas.remove();
    gif.style.display = 'block';

    // ── Clear any existing freeze timer ──
    if (gameState.gifFreezeTimer) {
        clearTimeout(gameState.gifFreezeTimer);
        gameState.gifFreezeTimer = null;
    }

    // ── Restart GIF from frame 1 ──
    const src = gif.src;
    gif.src   = '';
    setTimeout(() => { gif.src = src; }, 50);

    // ── Freeze GIF after one play — set to your GIF's duration ──
    const GIF_DURATION_MS = 5000; // ← Change this to match your GIF length

    gameState.gifFreezeTimer = setTimeout(() => {
        try {
            // Draw current GIF frame onto a canvas to freeze it
            const canvas    = document.createElement('canvas');
            canvas.id       = 'frozenGifCanvas';
            canvas.width    = gif.naturalWidth  || gif.offsetWidth  || 900;
            canvas.height   = gif.naturalHeight || gif.offsetHeight || 500;
            canvas.className = gif.className;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(gif, 0, 0, canvas.width, canvas.height);

            // Insert frozen canvas and hide the live GIF
            gif.parentNode.insertBefore(canvas, gif);
            gif.style.display = 'none';

        } catch (e) {
            // Canvas tainted (unlikely for local GIF) — just hide gif as fallback
            gif.style.visibility = 'hidden';
        }
        gameState.gifFreezeTimer = null;
    }, GIF_DURATION_MS);
}

// ============================================
// NAME PAGE
// ============================================

function showNamePage() {
    const scoreEl = document.getElementById('namePageScore');
    const rankEl  = document.getElementById('namePageRank');
    const hintsEl = document.getElementById('namePageHints');

    if (scoreEl) scoreEl.textContent = gameState.score;
    if (rankEl)  rankEl.textContent  = getFinalRank();
    if (hintsEl) hintsEl.textContent = `${gameState.hintPoints} / 10`;

    const input = document.getElementById('playerNameInput');
    const errEl = document.getElementById('nameError');
    if (input) input.value = '';
    if (errEl) errEl.style.display = 'none';

    showPage('namePage');

    setTimeout(() => {
        if (input) input.focus();
    }, 300);
}

function handleNameEnter(event) {
    if (event.key === 'Enter') confirmPlayerName();
}

function confirmPlayerName() {
    const input = document.getElementById('playerNameInput');
    const name  = input ? input.value.trim() : '';

    if (!name) {
        shakeInput();
        showNameError('⚠ Please enter your name to generate your certificate!');
        return;
    }
    if (name.length < 2) {
        shakeInput();
        showNameError('⚠ Name must be at least 2 characters!');
        return;
    }
    if (name.length > 40) {
        shakeInput();
        showNameError('⚠ Name must be 40 characters or fewer!');
        return;
    }

    gameState.playerName = name;
    generateCertificate(name);
    showPage('certificatePage');
}

function shakeInput() {
    const input = document.getElementById('playerNameInput');
    if (!input) return;
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 600);
}

function showNameError(msg) {
    const errEl = document.getElementById('nameError');
    if (!errEl) return;
    errEl.textContent   = msg;
    errEl.style.display = 'block';
    setTimeout(() => { errEl.style.display = 'none'; }, 4000);
}

// ============================================
// CERTIFICATE GENERATOR
// ============================================

function generateCertificate(name) {
    const canvas = document.getElementById('certificateCanvas');
    if (!canvas) return;

    const W = 1200, H = 800;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 1 ── Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,   '#060919');
    bg.addColorStop(0.5, '#0d1230');
    bg.addColorStop(1,   '#060919');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 2 ── Grid lines
    ctx.strokeStyle = 'rgba(0,240,255,0.04)';
    ctx.lineWidth   = 1;
    for (let x = 0; x <= W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // 3 ── Outer neon border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur  = 20;
    ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.shadowBlur  = 0;

    // 4 ── Inner purple border
    ctx.strokeStyle = 'rgba(181,55,242,0.45)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(26, 26, W - 52, H - 52);

    // 5 ── Corner brackets
    const br = 55, bg2 = 32;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth   = 3;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur  = 10;
    [
        [[bg2+br,bg2],[bg2,bg2],[bg2,bg2+br]],
        [[W-bg2-br,bg2],[W-bg2,bg2],[W-bg2,bg2+br]],
        [[bg2+br,H-bg2],[bg2,H-bg2],[bg2,H-bg2-br]],
        [[W-bg2-br,H-bg2],[W-bg2,H-bg2],[W-bg2,H-bg2-br]]
    ].forEach(pts => {
        ctx.beginPath();
        ctx.moveTo(...pts[0]);
        ctx.lineTo(...pts[1]);
        ctx.lineTo(...pts[2]);
        ctx.stroke();
    });
    ctx.shadowBlur = 0;

    // 6 ── Horizontal accent lines
    const hLine = ctx.createLinearGradient(0, 0, W, 0);
    hLine.addColorStop(0,   'transparent');
    hLine.addColorStop(0.3, 'rgba(0,240,255,0.2)');
    hLine.addColorStop(0.7, 'rgba(0,240,255,0.2)');
    hLine.addColorStop(1,   'transparent');
    ctx.fillStyle = hLine;
    ctx.fillRect(0, 68, W, 2);
    ctx.fillRect(0, H - 70, W, 2);

    // 7 ── Glowing dots
    [[60,60],[W-60,60],[60,H-60],[W-60,H-60],[W/2,46],[W/2,H-46]].forEach(([dx,dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 4, 0, Math.PI * 2);
        ctx.fillStyle   = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur  = 14;
        ctx.fill();
        ctx.shadowBlur  = 0;
    });

    // 8 ── Game title
    ctx.font        = 'bold 16px "Courier New",monospace';
    ctx.fillStyle   = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur  = 10;
    ctx.textAlign   = 'center';
    ctx.fillText('[ CIPHER MASTER — HACKER CHALLENGE ]', W / 2, 54);
    ctx.shadowBlur  = 0;

    // 9 ── Certificate title
    ctx.font        = 'bold 44px "Courier New",monospace';
    ctx.fillStyle   = '#ffffff';
    ctx.shadowColor = '#b537f2';
    ctx.shadowBlur  = 25;
    ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 145);
    ctx.shadowBlur  = 0;

    // Title underline
    const tw   = ctx.measureText('CERTIFICATE OF COMPLETION').width;
    const tulx = W / 2 - tw / 2;
    const tug  = ctx.createLinearGradient(tulx, 0, tulx + tw, 0);
    tug.addColorStop(0,   '#b537f2');
    tug.addColorStop(0.5, '#00f0ff');
    tug.addColorStop(1,   '#b537f2');
    ctx.strokeStyle = tug;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(tulx, 156);
    ctx.lineTo(tulx + tw, 156);
    ctx.stroke();

    // 10 ── "This is to certify that"
    ctx.font      = '19px "Courier New",monospace';
    ctx.fillStyle = 'rgba(0,240,255,0.65)';
    ctx.fillText('THIS IS TO CERTIFY THAT', W / 2, 218);

    // 11 ── Player name
    let nameFontSize = 66;
    ctx.font = `bold ${nameFontSize}px "Courier New",monospace`;
    while (ctx.measureText(name.toUpperCase()).width > W - 140 && nameFontSize > 26) {
        nameFontSize -= 2;
        ctx.font = `bold ${nameFontSize}px "Courier New",monospace`;
    }
    const nameY = 305;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur  = 30;
    ctx.fillStyle   = '#00ffcc';
    ctx.fillText(name.toUpperCase(), W / 2, nameY);
    ctx.shadowBlur  = 0;

    // Name underline
    const nw   = ctx.measureText(name.toUpperCase()).width;
    const nulx = W / 2 - nw / 2;
    const nug  = ctx.createLinearGradient(nulx, 0, nulx + nw, 0);
    nug.addColorStop(0,   'transparent');
    nug.addColorStop(0.2, '#00f0ff');
    nug.addColorStop(0.8, '#00f0ff');
    nug.addColorStop(1,   'transparent');
    ctx.strokeStyle = nug;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(nulx, nameY + 14);
    ctx.lineTo(nulx + nw, nameY + 14);
    ctx.stroke();

    // 12 ── "Has successfully completed"
    ctx.font      = '19px "Courier New",monospace';
    ctx.fillStyle = 'rgba(0,240,255,0.65)';
    ctx.fillText('HAS SUCCESSFULLY COMPLETED ALL 10 CIPHER CHALLENGES', W / 2, 362);

    // 13 ── Stats boxes
    const statsY = 440;
    const sData  = [
        { label: 'FINAL SCORE',  value: `${gameState.score} PTS`,        color: '#00ff41' },
        { label: 'RANK',         value:  getFinalRank(),                  color: '#b537f2' },
        { label: 'HINT POINTS',  value: `${gameState.hintPoints} / 10`,  color: '#ffaa00' },
        { label: 'DATE',         value:  getFormattedDate(),              color: '#00f0ff' }
    ];
    const sbW = 218, sbH = 78, sgap = 28;
    const stotalW  = sData.length * sbW + (sData.length - 1) * sgap;
    const sstartX  = W / 2 - stotalW / 2;

    sData.forEach((s, i) => {
        const bx = sstartX + i * (sbW + sgap);
        const by = statsY;

        ctx.fillStyle = 'rgba(0,240,255,0.04)';
        ctx.fillRect(bx, by, sbW, sbH);

        ctx.strokeStyle = s.color;
        ctx.lineWidth   = 1.5;
        ctx.shadowColor = s.color;
        ctx.shadowBlur  = 8;
        ctx.strokeRect(bx, by, sbW, sbH);
        ctx.shadowBlur  = 0;

        ctx.font      = '11px "Courier New",monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText(s.label, bx + sbW / 2, by + 22);

        ctx.font        = `bold 21px "Courier New",monospace`;
        ctx.fillStyle   = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur  = 10;
        ctx.fillText(s.value, bx + sbW / 2, by + 55);
        ctx.shadowBlur  = 0;
    });

    // 14 ── Achievements
    const badgeY = 572;
    ctx.font      = '12px "Courier New",monospace';
    ctx.fillStyle = 'rgba(0,240,255,0.45)';
    ctx.fillText('ACHIEVEMENTS UNLOCKED:', W / 2, badgeY);

    ctx.font        = 'bold 14px "Courier New",monospace';
    ctx.fillStyle   = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur  = 8;
    ctx.fillText(getAchievementBadges(), W / 2, badgeY + 26);
    ctx.shadowBlur  = 0;

    // 15 ── Bottom signature
    ctx.font      = '12px "Courier New",monospace';
    ctx.fillStyle = 'rgba(0,240,255,0.35)';
    ctx.textAlign = 'left';
    ctx.fillText('VERIFIED BY: CIPHER MASTER SYSTEM v1.0', 58, H - 46);
    ctx.textAlign = 'right';
    ctx.fillText(`CERTIFICATE ID: CM-${generateCertID()}`, W - 58, H - 46);

    // 16 ── Watermark
    ctx.save();
    ctx.globalAlpha = 0.035;
    ctx.font        = 'bold 155px "Courier New",monospace';
    ctx.fillStyle   = '#00f0ff';
    ctx.textAlign   = 'center';
    ctx.translate(W / 2, H / 2 + 40);
    ctx.rotate(-0.2);
    ctx.fillText('CIPHER', 0, 0);
    ctx.restore();
}

// ── Helpers ──
function getFinalRank() {
    const s = gameState.score;
    if (s >= 95) return 'ELITE HACKER';
    if (s >= 80) return 'CYBER MASTER';
    if (s >= 65) return 'CRYPTO EXPERT';
    if (s >= 50) return 'CODE BREAKER';
    return               'CIPHER AGENT';
}

function getAchievementBadges() {
    const b = ['🏆 CIPHER MASTER'];
    if (gameState.score >= 100)         b.push('⭐ PERFECT SCORE');
    if (gameState.hintPoints === 10)    b.push('🧠 NO HINTS NEEDED');
    else if (gameState.hintPoints >= 7) b.push('💡 HINT SAVER');
    if (gameState.score >= 90)          b.push('🔥 NEAR FLAWLESS');
    return b.join('   ');
}

function getFormattedDate() {
    const n  = new Date();
    const dd = String(n.getDate()).padStart(2, '0');
    const mm = String(n.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${n.getFullYear()}`;
}

function generateCertID() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function downloadCertificate() {
    const canvas = document.getElementById('certificateCanvas');
    if (!canvas) return;
    const link    = document.createElement('a');
    link.download = `CipherMaster_${gameState.playerName.replace(/\s+/g, '_')}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    updateMainPageStats();
});
