/* ============================================
   UNDANGAN KHITANAN KINTANAN
   script.js
   ============================================ */

'use strict';

const CONFIG = {
  childName: 'Kintanan',
  musicSrc:  'audio/backsound.mp3',
};

/* ── COVER STARS ── */
function createStars() {
  const container = document.querySelector('.cover-stars');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const dot = document.createElement('div');
    dot.className = 'star-dot';
    const size = Math.random() * 3 + 1.5;
    dot.style.cssText =
      'width:' + size + 'px;' +
      'height:' + size + 'px;' +
      'top:' + (Math.random() * 100) + '%;' +
      'left:' + (Math.random() * 100) + '%;' +
      'animation-duration:' + (Math.random() * 3 + 2).toFixed(1) + 's;' +
      'animation-delay:' + (Math.random() * 4).toFixed(1) + 's;';
    container.appendChild(dot);
  }
}
createStars();

/* ── OPEN INVITATION ── */
function openInvitation() {
  const cover = document.getElementById('cover');
  cover.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
  cover.style.opacity    = '0';
  cover.style.transform  = 'scale(1.04)';
  setTimeout(function() {
    cover.style.display = 'none';
    document.getElementById('main-content').classList.add('active');
    document.getElementById('musicBtn').classList.add('show');
    tryPlayMusic();
    initScrollAnimations();
    window.addEventListener('scroll', handleNavScroll, { passive: true });
  }, 900);
}

/* ── NAVBAR ── */
function handleNavScroll() {
  var nav = document.getElementById('siteNav');
  if (!nav) return;
  nav.classList.toggle('show', window.scrollY > 80);
}

/* ── SCROLL ANIMATIONS ── */
function initScrollAnimations() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function(el) {
    observer.observe(el);
  });
}

/* ── MUSIC ── */
var musicPlaying = false;

function tryPlayMusic() {
  var music = document.getElementById('bgMusic');
  if (!music) return;
  music.src = CONFIG.musicSrc;
  music.play()
    .then(function() { musicPlaying = true; updateMusicIcon(); })
    .catch(function() {});
}

function toggleMusic() {
  var music = document.getElementById('bgMusic');
  if (!music) return;
  if (musicPlaying) { music.pause(); musicPlaying = false; }
  else { music.play().then(function() { musicPlaying = true; }); }
  updateMusicIcon();
}

function updateMusicIcon() {
  var icon = document.getElementById('musicIcon');
  if (icon) icon.className = musicPlaying ? 'fas fa-music' : 'fas fa-pause';
}

/* ── COPY ADDRESS ── */
function copyAddress(address, btn) {
  function doSuccess() {
    btn.classList.add('copied');
    var span = btn.querySelector('span');
    var icon = btn.querySelector('i');
    var orig = span.textContent;
    icon.className = 'fas fa-check';
    span.textContent = 'Tersalin!';
    setTimeout(function() {
      btn.classList.remove('copied');
      icon.className = 'fas fa-copy';
      span.textContent = orig;
    }, 2500);
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(address).then(doSuccess).catch(function() { fallbackCopy(address, doSuccess); });
  } else {
    fallbackCopy(address, doSuccess);
  }
}

function fallbackCopy(text, cb) {
  var el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;top:-9999px;opacity:0;';
  document.body.appendChild(el);
  el.focus(); el.select();
  try { document.execCommand('copy'); cb(); } catch(e) {}
  document.body.removeChild(el);
}

/* ── GLOBALS ── */
window.openInvitation = openInvitation;
window.toggleMusic    = toggleMusic;
window.copyAddress    = copyAddress;
