// Shared interaction system for all pages
const body = document.body;

window.addEventListener('load', () => {
    const wipe = document.querySelector('.page-wipe');
    const isHome = /\/(index\.html)?$/.test(location.pathname);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Non-home pages: keep the original fast wipe-off ──────────────────────────
    if (!isHome || !wipe) {
        setTimeout(() => wipe?.classList.add('hide'), 250);
        return;
    }

    // ── Homepage intro sequence ───────────────────────────────────────────────────
    // Reduced-motion users just get an instant reveal with no animation.
    if (reducedMotion) {
        wipe.classList.add('hide');
        return;
    }

    // 1. Build the temporary splash logo inside the wipe overlay.
    //    Mirrors the real .brand markup (EKANSH<span>.DEV</span>).
    const splash = document.createElement('div');
    splash.className = 'intro-logo';
    splash.setAttribute('aria-hidden', 'true');
    splash.innerHTML = 'EKANSH<span>.DEV</span>';
    wipe.appendChild(splash);

    // 2. Grab the real .brand's position AFTER the layout has settled.
    //    We need this to calculate where the splash should fly to.
    const brand = document.querySelector('.brand');

    // Phase A → hold: logo appears large and centered inside the wipe (CSS handles this).
    // We trigger the "appear" class after a micro-delay so the initial opacity:0 state paints.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            splash.classList.add('intro-logo--visible');
        });
    });

    // Phase B → fly: after the hold, the logo shrinks to the header and the wipe rolls up simultaneously.
    const FLY_DELAY = 850; // ms to hold the large centered logo before flying
    const WIPE_DUR = 680; // ms for the wipe slide-up (matches .intro-wipe-out transition in CSS)

    setTimeout(() => {
        if (brand) {
            const brandRect = brand.getBoundingClientRect();
            const splashRect = splash.getBoundingClientRect();

            const targetCX = brandRect.left + brandRect.width / 2;
            const targetCY = brandRect.top + brandRect.height / 2;
            const splashCX = splashRect.left + splashRect.width / 2;
            const splashCY = splashRect.top + splashRect.height / 2;

            const dx = targetCX - splashCX;
            const dy = targetCY - splashCY;

            const splashFS = parseFloat(getComputedStyle(splash).fontSize) || 80;
            const brandFS = parseFloat(getComputedStyle(brand).fontSize) || 13;
            const scale = brandFS / splashFS;

            splash.style.setProperty('--fly-x', `${dx}px`);
            splash.style.setProperty('--fly-y', `${dy}px`);
            splash.style.setProperty('--fly-scale', scale);
            splash.classList.add('intro-logo--fly');
        }

        // Wipe rolls up at the same time as the logo shrinks and flies.
        wipe.classList.add('intro-wipe-out');

        // Remove from DOM once the wipe has fully scrolled off.
        setTimeout(() => wipe.remove(), WIPE_DUR + 50);

    }, FLY_DELAY);
});


const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.10
});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
const label = document.querySelector('.cursor-label');
let mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};
let ringPos = {
    ...mouse
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
(function cursorLoop() {
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
})();

document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
        body.classList.add('cursor-active');
        if (label) label.textContent = el.dataset.cursor || 'OPEN';
    });
    el.addEventListener('mouseleave', () => body.classList.remove('cursor-active'));
});

const magnets = document.querySelectorAll('.magnetic');
window.addEventListener('mousemove', (e) => {
    if (window.matchMedia('(max-width: 760px)').matches) return;
    magnets.forEach((el) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        const distance = Math.hypot(x, y);
        el.style.transform = distance < 120 ? `translate(${x * 0.12}px, ${y * 0.12}px)` : '';
    });
});

// Mobile menu
const menuBtn = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

function setMenu(open) {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'CLOSE' : 'MENU';
}
menuBtn?.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => setMenu(false)));

// Scroll progress
const progress = document.querySelector('.progress-line span');
const progressMark = document.querySelector('.progress-mark');

function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? scrollY / max : 0;
    if (progress) progress.style.height = `${pct * 100}%`;
    if (progressMark) progressMark.textContent = String(Math.min(99, Math.floor(pct * 100))).padStart(2, '0');
}
window.addEventListener('scroll', updateProgress, {
    passive: true
});
updateProgress();

document.getElementById('topBtn')?.addEventListener('click', () => window.scrollTo({
    top: 0,
    behavior: 'smooth'
}));

// Soft page transition for local pages
function transitionTo(href) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || href.startsWith('//'))
        return;
    const wipe = document.querySelector('.page-wipe');
    if (!wipe) {
        location.href = href;
        return;
    }
    wipe.classList.remove('hide');
    setTimeout(() => {
        location.href = href;
    }, 520);
}
document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) {
        const href = a.getAttribute('href');
        if (href && href.endsWith('.html') && !href.startsWith('http') && !href.startsWith('//')) {
            e.preventDefault();
            transitionTo(href);
        }
    }
});

// Reach the end of the page -> hover/tap anywhere to jump to the sequential next page
const PAGE_FLOW = {
    'index.html': {
        href: 'service.html',
        label: 'NEXT — WORK'
    },
    'service.html': {
        href: 'experience.html',
        label: 'NEXT — EXPERIENCE'
    },
    'experience.html': {
        href: 'skills.html',
        label: 'NEXT — SKILLS'
    },
    'skills.html': {
        href: 'contact.html',
        label: 'NEXT — CONTACT'
    },
    'contact.html': {
        href: 'index.html',
        label: 'BACK TO TOP — HOME'
    }
};

(function setupNextPage() {
    let current = location.pathname.split('/').pop() || 'index.html';
    if (!PAGE_FLOW[current]) {
        const found = Object.keys(PAGE_FLOW).find(k => location.pathname.endsWith(k));
        current = found || 'index.html';
    }
    const next = PAGE_FLOW[current] || PAGE_FLOW['index.html'];

    const sentinel = document.querySelector('.page-end-sentinel');
    const note = document.querySelector('.next-note');
    if (!sentinel || !note) return;

    note.textContent = next.label;

    let atEnd = false;

    // Position the note offset from the raw cursor so it never collides with
    // .cursor-dot / .cursor-ring (those are hidden via CSS when next-ready is active,
    // but the offset also keeps things visually clean).
    function updateNotePosition(clientX, clientY) {
        if (window.matchMedia('(max-width: 760px)').matches) return;

        // Place the note to the bottom-right of the cursor with a clear gap
        const offsetX = 22;
        const offsetY = 18;
        let x = clientX + offsetX;
        let y = clientY + offsetY;

        // Clamp to viewport edges so it never runs off-screen
        const rect = note.getBoundingClientRect();
        const w = rect.width || 160;
        const h = rect.height || 42;
        if (x + w > window.innerWidth - 14) x = Math.max(14, clientX - w - 14);
        if (y + h > window.innerHeight - 14) y = Math.max(14, clientY - h - 14);

        note.style.left = `${x}px`;
        note.style.top = `${y}px`;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            atEnd = entry.isIntersecting;
            document.body.classList.toggle('next-ready', atEnd);
            if (atEnd) updateNotePosition(mouse.x, mouse.y);
        });
    }, {
        threshold: 0,
        rootMargin: '0px 0px 150px 0px'
    });
    io.observe(sentinel);

    window.addEventListener('mousemove', (e) => {
        if (!atEnd) return;
        updateNotePosition(e.clientX, e.clientY);
    });

    function isInteractive(el) {
        return !!el.closest('a, button, summary, input, textarea, .faq-item, .mail-card, .top-btn');
    }

    function tryAdvance(e) {
        if (!atEnd) return;
        if (isInteractive(e.target)) return;
        transitionTo(next.href);
    }
    document.addEventListener('click', tryAdvance);
})();

// Copy email cards
const copyBtn = document.getElementById('copyMail');
const copyState = document.getElementById('copyState');
copyBtn?.addEventListener('click', async () => {
    const email = copyBtn.dataset.email || 'ekanshsaraswat1234@gmail.com';
    try {
        await navigator.clipboard.writeText(email);
        if (copyState) copyState.innerHTML = 'Copied! <span>✓</span>';
        copyBtn.animate([{
            transform: 'scale(1)'
        },
        {
            transform: 'scale(.97)'
        },
        {
            transform: 'scale(1.02)'
        },
        {
            transform: 'scale(1)'
        }
        ], {
            duration: 380,
            easing: 'cubic-bezier(.2,.8,.2,1)'
        });
        setTimeout(() => {
            if (copyState) copyState.innerHTML = 'Click to copy <span>↗</span>';
        }, 1800);
    } catch {
        if (copyState) copyState.textContent = email;
    }
});

// FAQ accordion: only one open at a time
const details = document.querySelectorAll('.faq-item');
details.forEach(item => {
    item.addEventListener('toggle', () => {
        if (!item.open) return;
        details.forEach(other => {
            if (other !== item) other.removeAttribute('open');
        });
    });
});

// Price number hover
const priceNumber = document.querySelector('.price-number');
if (priceNumber) {
    priceNumber.addEventListener('pointermove', (e) => {
        const r = priceNumber.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        priceNumber.style.transform = `translate(${x * .03}px, ${y * .03}px) rotate(${x * .01}deg)`;
    });
    priceNumber.addEventListener('pointerleave', () => priceNumber.style.transform = '');
}

// ── Navbar legibility: switch off mix-blend-mode when header overlaps body copy ──
// We watch paragraph/body-text elements. When one enters the ~70px-tall header zone
// we add .header-on-text to the <header> so it gets a solid backdrop instead.
(function setupNavLegibility() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    // Selectors that represent "dense body text" (not giant headings or empty backgrounds)
    const textSelectors = [
        '.hero-lede',
        '.number-item p',
        '.process-card p',
        '.faq-answer',
        '.price-description',
        '.price-meta',
        '.footer p',
        '.intro-grid p',
        '.section-tag'
    ].join(', ');

    const textEls = document.querySelectorAll(textSelectors);
    if (!textEls.length) return;

    // rootMargin crops the intersection root to just the header strip at the top.
    // A negative bottom margin of -(viewport - headerHeight) means only the top ~70px
    // of the viewport counts as the "root" for intersection purposes.
    const HEADER_H = 70; // px — generous enough to cover the 18px offset + content

    let onTextCount = 0;

    const navObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                onTextCount++;
            } else {
                onTextCount = Math.max(0, onTextCount - 1);
            }
        });
        header.classList.toggle('header-on-text', onTextCount > 0);
    }, {
        threshold: 0,
        // Keep only the top HEADER_H px of the viewport as the intersection root
        rootMargin: `0px 0px -${Math.max(0, window.innerHeight - HEADER_H)}px 0px`
    });

    textEls.forEach(el => navObs.observe(el));
})();

// ── 1. Click ripple / pulse feedback ─────────────────────────────────────────
// Spawns a short-lived circular ripple at every click point, layered under the
// cursor system. Touch devices also get it (gives tactile feedback).
(function setupClickRipple() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.addEventListener('click', (e) => {
        // Skip ripples on page-wipe links (transition would hide them anyway)
        const ripple = document.createElement('span');
        ripple.className = 'click-ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);
        // Use animationend to clean up without a hard timeout race
        ripple.addEventListener('animationend', () => ripple.remove(), {
            once: true
        });
    });
})();

// ── 2. Staggered card reveal on scroll ───────────────────────────────────────
// Applies staggered entrance animation to multi-item containers. Each direct
// child gets a progressive transition-delay so they cascade in.
(function setupStaggeredReveal() {
    const STAGGER_MS = 80; // delay increment per child (ms)

    // Containers whose children should stagger
    const staggerSelectors = [
        '.service-list', // service rows (Work page)
        '.number-list', // numbered project items
        '.process-grid', // process cards (Experience page)
        '.feature-grid', // skill feature items (Skills page)
        '.faq-list', // FAQ items (Contact page)
    ];

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    staggerSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(container => {
            const children = Array.from(container.children);
            children.forEach((child, i) => {
                // Mark each child so CSS can use it; skip if it already has .reveal
                child.classList.add('stagger-child');
                if (!reducedMotion) {
                    child.style.transitionDelay = `${i * STAGGER_MS}ms`;
                }
            });

            // One observer per container — fires when the container itself is visible
            const io = new IntersectionObserver(([entry]) => {
                if (!entry.isIntersecting) return;
                children.forEach(child => child.classList.add('stagger-child--visible'));
                io.disconnect();
            }, {
                threshold: 0.08
            });

            io.observe(container);
        });
    });
})();

// ── 3. Tilt / 3-D rotate on card hover ───────────────────────────────────────
// Applies a subtle perspective-tilt on pointermove, resets on pointerleave.
// Skipped on touch/mobile.
(function setupCardTilt() {
    if (window.matchMedia('(max-width: 760px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return; // no touch

    const MAX_DEG = 5; // max tilt degrees on any axis
    const tiltSelectors = [
        '.number-item', // project cards (Work page)
        '.process-card', // process/experience cards
        '.price-card', // skills price card
        '.feature', // feature items
    ];

    tiltSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform 0.08s ease';
            card.style.willChange = 'transform';

            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                // Normalised position within the card: -1 → +1
                const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
                const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
                // rotateY: positive nx tilts the right edge away
                // rotateX: positive ny tilts the bottom edge toward viewer
                card.style.transform =
                    `perspective(800px) rotateY(${nx * MAX_DEG}deg) rotateX(${-ny * MAX_DEG}deg)`;
            });

            card.addEventListener('pointerleave', () => {
                card.style.transition = 'transform 0.45s cubic-bezier(.2,.8,.2,1)';
                card.style.transform = '';
                // Restore snappy transition after reset
                card.addEventListener('pointermove', () => {
                    card.style.transition = 'transform 0.08s ease';
                }, {
                    once: true
                });
            });
        });
    });
})();

// ── 4. Progress rail mini-map with section tick marks ────────────────────────
// Reads every major <section> / <main> child with a meaningful bounding box,
// places a small tick on the progress rail at the proportional scroll position,
// and scrolls to that section smoothly on click.
(function setupProgressMinimap() {
    const rail = document.querySelector('.progress-rail');
    if (!rail) return;

    // Make the rail interactive
    rail.style.pointerEvents = 'auto';
    rail.style.cursor = 'none'; // keep cursor:none global feel

    // Gather all landmark sections (main children + closing + footer)
    const landmarks = Array.from(
        document.querySelectorAll('main > section, main > *, .closing, .footer')
    ).filter(el => el.getBoundingClientRect().height > 50);

    if (!landmarks.length) return;

    const totalH = () => document.documentElement.scrollHeight - window.innerHeight;

    landmarks.forEach((section, i) => {
        const tick = document.createElement('button');
        tick.className = 'rail-tick';
        tick.setAttribute('aria-label', `Scroll to section ${i + 1}`);
        tick.setAttribute('type', 'button');
        rail.appendChild(tick);

        // Position tick lazily after layout
        function positionTick() {
            const h = totalH();
            if (h <= 0) return;
            const top = section.getBoundingClientRect().top + scrollY;
            const pct = Math.min(100, Math.max(0, (top / h) * 100));
            tick.style.top = `${pct}%`;
        }

        positionTick();
        window.addEventListener('resize', positionTick, {
            passive: true
        });

        // Try to derive a readable label from the section
        const heading = section.querySelector('h1, h2, h3, .eyebrow, .section-tag');
        if (heading) {
            tick.setAttribute('aria-label', heading.textContent.trim().slice(0, 30));
        }

        tick.addEventListener('click', () => {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });

        // Highlight tick when section is in view
        const io = new IntersectionObserver(([entry]) => {
            tick.classList.toggle('rail-tick--active', entry.isIntersecting);
        }, {
            threshold: 0.15
        });
        io.observe(section);
    });
})();

// ── 5. Footer social link hover tooltips ─────────────────────────────────────
// Shows a small sticky-note-style tooltip near the cursor for footer links that
// have a data-tooltip attribute (or falls back to the link text).
(function setupFooterTooltips() {
    if (window.matchMedia('(max-width: 760px)').matches) return;

    // Stamp data-tooltip on the known footer social links if not already present
    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks.forEach(a => {
        const text = a.textContent.trim().replace(/\s*↗\s*$/, ''); // strip arrow
        if (!a.dataset.tooltip) a.dataset.tooltip = text;
    });

    // Shared tooltip element (one, reused for all links)
    const tip = document.createElement('div');
    tip.className = 'footer-tip';
    tip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tip);

    let activeTip = null;
    let tipX = 0,
        tipY = 0;

    function moveTip(e) {
        tipX = e.clientX + 16;
        tipY = e.clientY - 10;
        tip.style.left = `${tipX}px`;
        tip.style.top = `${tipY}px`;
    }

    footerLinks.forEach(a => {
        a.addEventListener('mouseenter', (e) => {
            const label = a.dataset.tooltip || a.textContent.trim();
            tip.textContent = label;
            tip.classList.add('footer-tip--visible');
            activeTip = a;
            moveTip(e);
        });

        a.addEventListener('mousemove', moveTip);

        a.addEventListener('mouseleave', () => {
            tip.classList.remove('footer-tip--visible');
            activeTip = null;
        });
    });
})();

// Contact form: submit visitor messages to the Express/Resend backend.
(function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const submitButton = document.getElementById('submitContact');
    const formStatus = document.getElementById('formStatus');
    const API_URL = ''; // relative path — works on Vercel (/api/contact) and local serve

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        if (!name || !email || !message) {
            formStatus.textContent = 'Please fill in all fields.';
            return;
        }

        if (!email.includes('@')) {
            formStatus.textContent = 'Please enter a valid email address.';
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = 'SENDING...';
        formStatus.textContent = '';

        try {
            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to send message.');
            }

            formStatus.textContent = 'Message sent successfully!';
            form.reset();
        } catch (error) {
            console.error('Contact form error:', error);
            formStatus.textContent = error.message === 'Failed to fetch'
                ? 'Backend is unavailable. Start the server and try again.'
                : 'Unable to send message. Please try again.';
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'SEND MESSAGE <span>↗</span>';
        }
    });
})();
