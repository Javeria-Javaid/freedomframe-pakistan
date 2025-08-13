const flagWrap = document.getElementById('flagWrap');
const flagImg = document.getElementById('flag');
const hoistBtn = document.getElementById('hoistBtn');
const celebrateBtn = document.getElementById('celebrateBtn');
const celebrationMsg = document.getElementById('celebrateMsg');

let isHoisted = false;

// ===== Canvas setup =====
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

// ===== Animation loop =====
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

// ===== Celebration trigger =====
function celebrate() {
    sprinkle();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5; // upper half
            boom(x, y);
        }, i * 500);
    }
    celebrationMsg.classList.add('show');
}

// ===== Flag hoisting =====
hoistBtn.addEventListener('click', () => {
    if (!isHoisted) {
        flagWrap.style.bottom = "calc(77% - 80px)";
        isHoisted = true;
        hoistBtn.textContent = "Lower the Flag";

        setTimeout(() => {
            flagImg.classList.add('flag-wave');
            celebrate(); // auto trigger celebration after hoist
        }, 1500);

    } else {
        flagWrap.style.bottom = "0";
        isHoisted = false;
        hoistBtn.textContent = "Hoist the Flag";

        flagImg.classList.remove('flag-wave');
        celebrationMsg.classList.remove('show');
    }
});

// ===== Celebrate button =====
celebrateBtn.addEventListener('click', celebrate);