    /* ══════════════════════════════════════════════════
    rsvp.js — dengan fitur Pagination (6 per halaman)
    ══════════════════════════════════════════════════ */

    var RSVP_URL = 'https://script.google.com/macros/s/AKfycbz1etWEif1mF6q6k3w1nGpHVvQD-bztZxnlTvkxXi324U0D7-bMiAhp6yMY5h2IBmwn/exec';

    var PER_PAGE    = 5;    /* jumlah ucapan per halaman */
    var rsvpAllRows = [];   /* simpan semua data dari Sheets */
    var rsvpPage    = 1;    /* halaman aktif saat ini */

    /* ── Baca nama tamu dari ?to= ── */
    var namaGuest = (function () {
    var raw = new URLSearchParams(window.location.search).get('to') || '';
    return raw.trim().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    })();

    /* ── Cover: sapa tamu ── */
    function initCoverGuest() {
    var wrap = document.getElementById('coverGuestWrap');
    if (!wrap || !namaGuest) return;
    wrap.innerHTML =
        '<div class="cover-guest-box">' +
        '<span class="cover-guest-to">Kepada Yth.</span>' +
        '<span class="cover-guest-name">' + rsvpEsc(namaGuest) + '</span>' +
        '</div>';
    }

    /* ── RSVP Form: kondisi input nama ── */
    function initRsvpGuest() {
    var fieldNama  = document.getElementById('rsvpNamaField');
    var inputNama  = document.getElementById('rsvpNama');
    var banner     = document.getElementById('rsvpGuestBanner');
    var bannerName = document.getElementById('rsvpGuestName');
    if (!fieldNama) return;
    if (namaGuest) {
        fieldNama.style.display = 'none';
        if (banner)     banner.style.display   = 'flex';
        if (bannerName) bannerName.textContent = namaGuest;
        if (inputNama)  inputNama.value        = namaGuest;
    } else {
        fieldNama.style.display = '';
        if (banner) banner.style.display = 'none';
    }
    }

    /* ── Kirim ucapan ── */
    function rsvpKirim() {
    var inputNama = document.getElementById('rsvpNama');
    var nama  = namaGuest || (inputNama ? inputNama.value.trim() : '');
    var hadir = document.getElementById('rsvpHadir').value;
    var pesan = document.getElementById('rsvpPesan').value.trim();
    var btn   = document.getElementById('rsvpSubmitBtn');

    if (!nama)         { rsvpSetStatus('Mohon masukkan nama Anda.', 'error'); return; }
    if (!hadir||!pesan){ rsvpSetStatus('Mohon lengkapi semua kolom terlebih dahulu.', 'error'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mengirim...';
    rsvpSetStatus('', '');

    fetch(RSVP_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({ action:'tambah', nama:nama, hadir:hadir, pesan:pesan }).toString(),
    })
        .then(function(r){ return r.json(); })
        .then(function(data){
        if (data.status === 'ok') {
            if (!namaGuest && inputNama) inputNama.value = '';
            document.getElementById('rsvpHadir').value = '';
            document.getElementById('rsvpPesan').value = '';
            rsvpSetStatus('Jazakumullahu khairan! Ucapan Anda telah terkirim. 🤲', 'ok');
            rsvpPage = 1;
            rsvpMuat();
        } else {
            rsvpSetStatus('Gagal mengirim. Silakan coba lagi.', 'error');
        }
        })
        .catch(function(){ rsvpSetStatus('Koneksi gagal. Periksa jaringan Anda.', 'error'); })
        .finally(function(){
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Kirim Ucapan';
        });
    }

    /* ── Muat semua ucapan dari Sheets ── */
    function rsvpMuat() {
    var countEl = document.getElementById('rsvpCount');
    var btn     = document.querySelector('.rsvp-refresh');
    if (btn) btn.classList.add('spinning');

    fetch(RSVP_URL + '?action=ambil')
        .then(function(r){ return r.json(); })
        .then(function(data){
        rsvpAllRows = (data.rows || []).slice().reverse(); /* terbaru di atas */
        countEl.innerHTML = '<i class="fas fa-comments me-1"></i>' + rsvpAllRows.length + ' Ucapan';
        rsvpRenderPage(rsvpPage);
        })
        .catch(function(){
        countEl.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Gagal memuat';
        document.getElementById('rsvpList').innerHTML =
            '<div class="rsvp-empty"><i class="fas fa-wifi"></i>Gagal terhubung. Coba refresh.</div>';
        })
        .finally(function(){ if (btn) btn.classList.remove('spinning'); });
    }

    /* ── Render halaman tertentu ── */
    function rsvpRenderPage(page) {
    var listEl    = document.getElementById('rsvpList');
    var totalPage = Math.ceil(rsvpAllRows.length / PER_PAGE);

    rsvpPage = Math.max(1, Math.min(page, totalPage || 1));

    if (rsvpAllRows.length === 0) {
        listEl.innerHTML =
        '<div class="rsvp-empty"><i class="fas fa-comment-slash"></i>Jadilah yang pertama memberi ucapan 🌿</div>';
        rsvpRenderPagination(0, 0);
        return;
    }

    var start = (rsvpPage - 1) * PER_PAGE;
    var slice = rsvpAllRows.slice(start, start + PER_PAGE);

    listEl.innerHTML = slice.map(function(r, i){
        var badgeClass =
        r.hadir === 'Hadir'       ? 'hadir' :
        r.hadir === 'Tidak Hadir' ? 'tidak' : 'ragu';
        return '<div class="rsvp-card" style="animation-delay:' + (i * 0.05) + 's">' +
        '<div class="rsvp-card-head">' +
            '<span class="rsvp-card-name">' +
            '<i class="fas fa-user-circle me-2" style="color:var(--rsvp-primary);font-size:0.85rem;"></i>' +
            rsvpEsc(r.nama) +
            '</span>' +
            '<span class="rsvp-card-badge ' + badgeClass + '">' + rsvpEsc(r.hadir) + '</span>' +
        '</div>' +
        '<p class="rsvp-card-msg">"' + rsvpEsc(r.pesan) + '"</p>' +
        '<p class="rsvp-card-time"><i class="fas fa-clock me-1"></i>' + rsvpEsc(r.waktu) + '</p>' +
        '</div>';
    }).join('');

    rsvpRenderPagination(rsvpPage, totalPage);
    }

    /* ── Render tombol pagination ── */
    function rsvpRenderPagination(current, total) {
    var old = document.getElementById('rsvpPagination');
    if (old) old.remove();
    if (total <= 1) return;

    var wrap = document.createElement('div');
    wrap.id = 'rsvpPagination';
    wrap.className = 'rsvp-pagination';

    /* Prev */
    var prev = document.createElement('button');
    prev.className = 'rsvp-page-btn' + (current === 1 ? ' disabled' : '');
    prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prev.disabled  = current === 1;
    prev.onclick   = function(){ rsvpGoPage(current - 1); };
    wrap.appendChild(prev);

    /* Nomor halaman */
    for (var i = 1; i <= total; i++) {
        (function(p){
        var btn = document.createElement('button');
        btn.className   = 'rsvp-page-btn' + (p === current ? ' active' : '');
        btn.textContent = p;
        btn.onclick     = function(){ rsvpGoPage(p); };
        wrap.appendChild(btn);
        })(i);
    }

    /* Next */
    var next = document.createElement('button');
    next.className = 'rsvp-page-btn' + (current === total ? ' disabled' : '');
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';
    next.disabled  = current === total;
    next.onclick   = function(){ rsvpGoPage(current + 1); };
    wrap.appendChild(next);

    var listEl = document.getElementById('rsvpList');
    listEl.parentNode.insertBefore(wrap, listEl.nextSibling);
    }

    /* ── Ganti halaman + scroll ke atas list ── */
    function rsvpGoPage(page) {
    rsvpRenderPage(page);
    var listEl = document.getElementById('rsvpList');
    if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ── Helpers ── */
    function rsvpSetStatus(msg, type) {
    var el = document.getElementById('rsvpStatus');
    if (!el) return;
    el.textContent = msg;
    el.className = 'rsvp-status ' + type;
    }

    function rsvpEsc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ── Auto init ── */
    document.addEventListener('DOMContentLoaded', function(){
    initCoverGuest();
    initRsvpGuest();
    rsvpMuat();

    });
