const body = document.body;

// Page transition
window.addEventListener('load', () => {
    setTimeout(() => document.querySelector('.page-wipe')?.classList.add('hide'), 300);
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12
});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Smooth cursor follower + hover labels
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
const label = document.querySelector('.cursor-label');
let mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};
let ringPos = {
    x: mouse.x,
    y: mouse.y
};
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (dot) {
        dot.style.left = `${mouse.x}px`;
        dot.style.top = `${mouse.y}px`;
        dot.style.opacity = '1';
    }
});

function cursorLoop() {
    ringPos.x += (mouse.x - ringPos.x) * 0.16;
    ringPos.y += (mouse.y - ringPos.y) * 0.16;
    if (ring) {
        ring.style.left = `${ringPos.x}px`;
        ring.style.top = `${ringPos.y}px`;
        ring.style.opacity = '1';
    }
    if (label) {
        label.style.left = `${mouse.x + 16}px`;
        label.style.top = `${mouse.y - 10}px`;
    }
    requestAnimationFrame(cursorLoop);
}
cursorLoop();

document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
        body.classList.add('cursor-active');
        label.textContent = el.dataset.cursor;
    });
    el.addEventListener('mouseleave', () => body.classList.remove('cursor-active'));
});

// Magnetic elements
const magnets = document.querySelectorAll('.magnetic');
window.addEventListener('mousemove', (e) => {
    if (window.matchMedia('(max-width: 760px)').matches) return;
    magnets.forEach((el) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        const distance = Math.hypot(x, y);
        if (distance < 120) {
            el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        } else {
            el.style.transform = '';
        }
    });
});

// Copy mail + pulse feedback
const copyBtn = document.getElementById('copyMail');
const copyState = document.getElementById('copyState');
copyBtn?.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText('ekanshsaraswat1234@gmail.com');
        copyState.innerHTML = 'Copied! <span>✓</span>';
        copyBtn.animate([{
            transform: 'scale(1)'
        }, {
            transform: 'scale(.97)'
        }, {
            transform: 'scale(1.02)'
        }, {
            transform: 'scale(1)'
        }], {
            duration: 380,
            easing: 'cubic-bezier(.2,.8,.2,1)'
        });
        setTimeout(() => copyState.innerHTML = 'Click to copy <span>↗</span>', 1800);
    } catch {
        copyState.textContent = 'Copy: ekanshsaraswat1234@gmail.com';
    }
});

// Mobile menu
const menuBtn = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

function setMenu(open) {
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'CLOSE' : 'MENU';
}
menuBtn?.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => setMenu(false)));

// Scroll minimap progress
const progress = document.querySelector('.progress-line span');
const progressMark = document.querySelector('.progress-mark');
window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? scrollY / max : 0;
    if (progress) progress.style.height = `${pct * 100}%`;
    if (progressMark) progressMark.textContent =
        `${String(Math.min(99, Math.floor(pct * 100))).padStart(2, '0')}`;
}, {
    passive: true
});

// Footer back-to-top
const topBtn = document.getElementById('topBtn');
topBtn?.addEventListener('click', () => window.scrollTo({
    top: 0,
    behavior: 'smooth'
}));

// Tiny page-exit transition for internal links
function transitionTo(href) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
    const wipe = document.querySelector('.page-wipe');
    wipe.classList.remove('hide');
    setTimeout(() => location.href = href, 550);
}
document.querySelectorAll('a').forEach(a => a.addEventListener('click', () => transitionTo(a.getAttribute('href'))));

// Keyboard polish for FAQ details
const details = document.querySelectorAll('.faq-item');
details.forEach(item => {
    item.addEventListener('toggle', () => {
        if (!item.open) return;
        details.forEach(other => {
            if (other !== item) other.removeAttribute('open');
        });
    });
});