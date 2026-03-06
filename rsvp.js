    var RSVP_URL = 'https://script.google.com/macros/s/AKfycbz1etWEif1mF6q6k3w1nGpHVvQD-bztZxnlTvkxXi324U0D7-bMiAhp6yMY5h2IBmwn/exec';

    /* ──────────────────────────────────────
    KIRIM UCAPAN → POST ke Google Sheets
    ─────────────────────────────────────── */
    function rsvpKirim() {
    var nama  = document.getElementById('rsvpNama').value.trim();
    var hadir = document.getElementById('rsvpHadir').value;
    var pesan = document.getElementById('rsvpPesan').value.trim();
    var btn   = document.getElementById('rsvpSubmitBtn');

    /* Validasi */
    if (!nama || !hadir || !pesan) {
        rsvpSetStatus('Mohon lengkapi semua kolom terlebih dahulu.', 'error');
        return;
    }

    /* Loading state */
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mengirim...';
    rsvpSetStatus('', '');

    var body = new URLSearchParams({
        action: 'tambah',
        nama:   nama,
        hadir:  hadir,
        pesan:  pesan,
    });

    fetch(RSVP_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body.toString(),
    })
        .then(function(r) { return r.json(); })
        .then(function(data) {
        if (data.status === 'ok') {
            /* Reset form */
            document.getElementById('rsvpNama').value  = '';
            document.getElementById('rsvpHadir').value = '';
            document.getElementById('rsvpPesan').value = '';
            rsvpSetStatus('Jazakumullahu khairan! Ucapan Anda telah terkirim. 🤲', 'ok');
            /* Reload daftar */
            rsvpMuat();
        } else {
            rsvpSetStatus('Gagal mengirim. Silakan coba lagi.', 'error');
        }
        })
        .catch(function() {
        rsvpSetStatus('Koneksi gagal. Periksa jaringan Anda.', 'error');
        })
        .finally(function() {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Kirim Ucapan';
        });
    }

    /* ──────────────────────────────────────
    MUAT UCAPAN ← GET dari Google Sheets
    ─────────────────────────────────────── */
    function rsvpMuat() {
    var listEl  = document.getElementById('rsvpList');
    var countEl = document.getElementById('rsvpCount');
    var btn     = document.querySelector('.rsvp-refresh');

    if (btn) btn.classList.add('spinning');

    fetch(RSVP_URL + '?action=ambil')
        .then(function(r) { return r.json(); })
        .then(function(data) {
        var rows = data.rows || [];

        countEl.innerHTML = '<i class="fas fa-comments me-1"></i>' + rows.length + ' Ucapan';

        if (rows.length === 0) {
            listEl.innerHTML = '<div class="rsvp-empty"><i class="fas fa-comment-slash"></i>Jadilah yang pertama memberi ucapan 🌿</div>';
            return;
        }

        /* Tampilkan terbaru di atas */
        listEl.innerHTML = rows.slice().reverse().map(function(r, i) {
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
        })
        .catch(function() {
        countEl.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Gagal memuat';
        listEl.innerHTML  = '<div class="rsvp-empty"><i class="fas fa-wifi"></i>Gagal terhubung. Coba refresh.</div>';
        })
        .finally(function() {
        if (btn) btn.classList.remove('spinning');
        });
    }

    /* ──────────────────────────────────────
    HELPERS
    ─────────────────────────────────────── */
    function rsvpSetStatus(msg, type) {
    var el = document.getElementById('rsvpStatus');
    if (!el) return;
    el.textContent = msg;
    el.className = 'rsvp-status ' + type;
    }

    function rsvpEsc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /* ──────────────────────────────────────
    AUTO MUAT saat halaman siap
    (hapus jika ingin load manual saja)
    ─────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function() {
    rsvpMuat();
    });