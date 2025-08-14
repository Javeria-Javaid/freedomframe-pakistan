// ===== Firebase Configuration =====
const firebaseConfig = {
    apiKey: "AIzaSyCs2qw9mhsGuYROwfRD_2yA_KXvWMlbmTY",
    authDomain: "freedomframe-pakistan.firebaseapp.com",
    projectId: "freedomframe-pakistan",
    storageBucket: "freedomframe-pakistan.appspot.com",
    messagingSenderId: "247753657775",
    appId: "1:247753657775:web:34ec45a2a9a94ef8f6335a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== DOM Elements =====
const flagWrap = document.getElementById('flagWrap');
const flagImg = document.getElementById('flag');
const hoistBtn = document.getElementById('hoistBtn');
const celebrateBtn = document.getElementById('celebrateBtn');
const celebrationMsg = document.getElementById('celebrateMsg');
const wishForm = document.getElementById('wishForm');
const nameInput = document.getElementById('name');
const cityInput = document.getElementById('city');
const wishInput = document.getElementById('wish');
const grid = document.getElementById('grid');
const emptyMsg = document.getElementById('empty');
const wishCountElem = document.getElementById('wishCount');
const loveCountElem = document.getElementById('loveCount');
const leaveBtn = document.getElementById('leaveWishBtn');
const wishSection = document.getElementById('wishSection');

// ===== Animation Setup =====
let isHoisted = false;
const confetti = document.getElementById('confettiCanvas');
const fireworks = document.getElementById('fireworksCanvas');
const cctx = confetti.getContext('2d');
const fctx = fireworks.getContext('2d');

function resizeCanvas() {
    confetti.width = fireworks.width = window.innerWidth;
    confetti.height = fireworks.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===== Confetti =====
const bits = [];
function sprinkle() {
    for (let i = 0; i < 160; i++) {
        bits.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * -50,
            w: Math.random() * 4 + 4,
            h: Math.random() * 8 + 8,
            vy: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 1.6,
            r: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.12,
            col: Math.random() < 0.7 ? '#006600' : '#ffffff'
        });
    }
}

// ===== Fireworks =====
const sparks = [];
function boom(x, y) {
    for (let i = 0; i < 90; i++) {
        sparks.push({
            x, y,
            vx: Math.cos(i) * (Math.random() * 2) + (Math.random() - 0.5) * 3,
            vy: Math.sin(i) * (Math.random() * 2) + (Math.random() - 0.5) * 3,
            life: Math.random() * 50 + 40,
            age: 0,
            size: Math.random() * 1.6 + 1.2,
            hue: Math.random() * 40 + 40
        });
    }
}

// ===== Animation Loop =====
(function step() {
    requestAnimationFrame(step);

    // Confetti
    cctx.clearRect(0, 0, confetti.width, confetti.height);
    bits.forEach((b, i) => {
        b.vy += 0.01; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        cctx.save();
        cctx.translate(b.x, b.y);
        cctx.rotate(b.r);
        cctx.fillStyle = b.col;
        cctx.fillRect(-b.w/2, -b.h/2, b.w, b.h);
        cctx.restore();
        if (b.y > confetti.height + 30) bits.splice(i, 1);
    });

    // Fireworks
    fctx.clearRect(0, 0, fireworks.width, fireworks.height);
    sparks.forEach((s, i) => {
        s.age++;
        if (s.age > s.life) return;
        s.vy += 0.02;
        s.x += s.vx; s.y += s.vy;
        const alpha = 1 - s.age / s.life;
        fctx.beginPath();
        fctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
        fctx.fillStyle = `hsla(${s.hue}, 80%, 60%, ${alpha})`;
        fctx.fill();
        if (s.age > s.life) sparks.splice(i, 1);
    });
})();

// ===== Celebration Functions =====
function celebrate() {
    sprinkle();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5;
            boom(x, y);
        }, i * 500);
    }
    celebrationMsg.classList.add('show');
}

// ===== Flag Hoisting =====
hoistBtn.addEventListener('click', () => {
    if (!isHoisted) {
        flagWrap.style.bottom = "calc(77% - 80px)";
        isHoisted = true;
        hoistBtn.textContent = "Lower the Flag";

        setTimeout(() => {
            flagImg.classList.add('flag-wave');
            celebrate();
        }, 1500);

    } else {
        flagWrap.style.bottom = "0";
        isHoisted = false;
        hoistBtn.textContent = "Hoist the Flag";
        flagImg.classList.remove('flag-wave');
        celebrationMsg.classList.remove('show');
    }
});

// ===== Celebrate Button =====
celebrateBtn.addEventListener('click', celebrate);

// ===== Wish Functions =====
function createWishElement(wish, index) {
    const div = document.createElement('div');
    div.className = 'wish';
    div.innerHTML = `
        <p>${wish.text}</p>
        <div class="metaRow">
            <span>${wish.name || "Anonymous"}${wish.city ? ", " + wish.city : ""}</span>
            <span>
                <button class="like-btn" data-id="${wish.id}">❤️ ${wish.likes}</button>
                <button class="share-btn" data-index="${index}">📤</button>
            </span>
        </div>
    `;
    return div;
}

function updateCounters() {
    const totalWishes = wishes.length;
    const totalHearts = wishes.reduce((sum, w) => sum + w.likes, 0);
    wishCountElem.textContent = `📝 ${totalWishes} wishes`;
    loveCountElem.textContent = `❤️ ${totalHearts} hearts`;
}

// ===== Database Functions =====
let wishes = []; // This will store our wishes from Firestore

async function renderWishes() {
    try {
        const snapshot = await db.collection("wishes")
            .orderBy("timestamp", "desc")
            .get();

        wishes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        grid.innerHTML = '';
        if (wishes.length === 0) {
            emptyMsg.style.display = 'block';
        } else {
            emptyMsg.style.display = 'none';
            wishes.forEach((wish, idx) => {
                grid.appendChild(createWishElement(wish, idx));
            });
        }
        updateCounters();
    } catch (error) {
        console.error("Error loading wishes:", error);
        alert("Failed to load wishes. Please refresh the page.");
    }
}

// ===== Event Listeners =====
wishForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    if (!wishInput.value.trim()) {
        alert("Please write your wish before submitting!");
        return;
    }

    const newWish = {
        name: nameInput.value.trim() || "Anonymous",
        city: cityInput.value.trim(),
        text: wishInput.value.trim(),
        likes: 0,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("wishes").add(newWish);
        wishForm.reset();
    } catch (error) {
        console.error("Error adding wish:", error);
        alert("Failed to submit wish. Please try again.");
    }
});

grid.addEventListener('click', async (e) => {
    if (e.target.classList.contains('like-btn')) {
        const wishId = e.target.dataset.id;
        try {
            await db.collection("wishes").doc(wishId).update({
                likes: firebase.firestore.FieldValue.increment(1)
            });
            // Re-render to show updated likes
            renderWishes();
        } catch (error) {
            console.error("Error updating likes:", error);
        }
    } else if (e.target.classList.contains('share-btn')) {
        const index = e.target.dataset.index;
        const textToCopy = `"${wishes[index].text}" — ${wishes[index].name || "Anonymous"}`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            alert('Wish copied to clipboard!');
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    }
});

leaveBtn.addEventListener('click', () => {
    wishSection.scrollIntoView({ behavior: 'smooth' });
});

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    renderWishes();
});