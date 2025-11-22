// 1. PRELOADER
window.addEventListener('load', () => {
    document.getElementById('preloader').style.display = 'none';
});

// 2. CURSOR TRAIL
const cursorCanvas = document.getElementById('cursorCanvas');
const cCtx = cursorCanvas.getContext('2d');
let particles = [];

function resizeCursorCanvas() {
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCursorCanvas);
resizeCursorCanvas();

class Particle {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.life = 1;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        this.life -= 0.05;
        if (this.size > 0.2) this.size -= 0.1;
    }
    draw() {
        cCtx.fillStyle = `rgba(150, 150, 150, ${this.life})`;
        cCtx.beginPath();
        cCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        cCtx.fill();
    }
}
window.addEventListener('mousemove', (e) => particles.push(new Particle(e.x, e.y)));
function animateParticles() {
    cCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) { particles.splice(i, 1); i--; }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// 3. DO NOT CLICK BUTTON (Fixed)
const dontBtn = document.getElementById('dontClickBtn');
const warnings = ["I said DO NOT click!", "Hey! Warning you...", "Seriously?", "Okay, you win! 🍪"];
let clickIndex = 0;

dontBtn.addEventListener('click', () => {
    // Add shake class
    dontBtn.classList.add('shake');
    setTimeout(() => dontBtn.classList.remove('shake'), 500);
    
    if(clickIndex < warnings.length) {
        dontBtn.innerText = warnings[clickIndex];
        
        if(clickIndex === warnings.length - 1) {
            dontBtn.style.background = "#00b894";
            dontBtn.style.color = "#fff";
            // Fire Confetti
            if (typeof confetti === 'function') {
                confetti({ particleCount: 150, spread: 100, origin: { y: 0.8 } });
            }
        } else if (clickIndex > 1) {
            dontBtn.style.background = "#ff7675";
            dontBtn.style.color = "#fff";
        }
        
        clickIndex++;
    } else {
        dontBtn.innerText = "Do Not Click Me 🚫";
        dontBtn.style.background = "#fff";
        dontBtn.style.color = "#ff7675";
        clickIndex = 0;
    }
});

// 4. DRAWING CANVAS
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let painting = false;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function start(e) { painting = true; draw(e); }
function end() { painting = false; ctx.beginPath(); }
function draw(e) {
    if (!painting) return;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
}
document.addEventListener('mousedown', start);
document.addEventListener('mouseup', end);
document.addEventListener('mousemove', draw);
document.getElementById('clearBtn').addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));

// 5. DRAGGABLE STICKERS
const draggables = document.querySelectorAll('.draggable');
draggables.forEach(el => {
    let isDragging = false; let startX, startY, initialLeft, initialTop;
    const startDrag = (e) => {
        isDragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX; startY = clientY;
        const style = window.getComputedStyle(el);
        const matrix = new WebKitCSSMatrix(style.transform);
        initialLeft = matrix.m41; initialTop = matrix.m42;
        el.style.cursor = 'grabbing';
    };
    const onDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX; const dy = clientY - startY;
        el.style.transform = `translate(${initialLeft + dx}px, ${initialTop + dy}px)`;
    };
    const endDrag = () => { isDragging = false; el.style.cursor = 'grab'; };
    el.addEventListener('mousedown', startDrag); window.addEventListener('mousemove', onDrag); window.addEventListener('mouseup', endDrag);
    el.addEventListener('touchstart', startDrag, {passive: false}); window.addEventListener('touchmove', onDrag, {passive: false}); window.addEventListener('touchend', endDrag);
});

// 6. UTILITIES
function updateStatus() {
    const statusText = document.getElementById('statusText');
    const dot = document.querySelector('.dot');
    const hour = new Date().toLocaleString("en-US", {timeZone: "Asia/Karachi", hour: 'numeric', hour12: false});
    if (hour >= 0 && hour < 7) { statusText.innerText = "Sleeping 🌙"; dot.className = "dot offline"; }
    else { statusText.innerText = "Available ⚡"; dot.className = "dot online"; }
}
updateStatus();

const modal = document.getElementById('resume-modal');
document.getElementById('resumeBtn').addEventListener('click', () => modal.classList.add('active'));
document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));
window.addEventListener('click', (e) => { if(e.target == modal) modal.classList.remove('active'); });

// Counters
const counters = document.querySelectorAll('.counter');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = +counter.getAttribute('data-target');
            let count = 0; const increment = target / 50; 
            const updateCount = () => {
                count += increment;
                if (count < target) { counter.innerText = Math.ceil(count); requestAnimationFrame(updateCount); }
                else { counter.innerText = target >= 1000 ? (target / 1000) + 'k' : target; }
            };
            updateCount();
            observer.unobserve(counter);
        }
    });
});
counters.forEach(c => observer.observe(c));

// Init Libraries
if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".tilt-card"), { max: 15, speed: 400, glare: true, "max-glare": 0.2 });
}
if (window.roughNotation) {
    const { annotate, annotationGroup } = window.roughNotation;
    const a1 = annotate(document.querySelector('#name-highlight'), { type: 'highlight', color: '#ffeaa7' });
    const a2 = annotate(document.querySelector('#highlight-word'), { type: 'circle', color: '#ff7675' });
    setTimeout(() => annotationGroup([a1, a2]).show(), 1000);
}