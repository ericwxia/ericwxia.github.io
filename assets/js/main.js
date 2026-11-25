/* ==========================================================================
   Wei Xia — Static Website Interactions (Zero unsafe DOM sinks)
   ========================================================================== */

(function () {
  'use strict';

  // 1. Theme toggle (uses root data-theme attribute; no sensitive storage)
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  try {
    var savedTheme = window.localStorage.getItem('ui_theme_mode');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      root.setAttribute('data-theme', savedTheme);
    } else if (getPreferredTheme() === 'dark') {
      root.setAttribute('data-theme', 'dark');
    }
  } catch (_) {
    // Ignore storage access restrictions in strict privacy modes
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        window.localStorage.setItem('ui_theme_mode', next);
      } catch (_) {}
    });
  }

  // 2. Mobile navigation menu
  var menuBtn = document.getElementById('menu-toggle');
  var siteNav = document.getElementById('site-nav');
  if (menuBtn && siteNav) {
    menuBtn.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // 3. Copy obfuscated contact handle
  var copyBtn = document.getElementById('copy-contact-btn');
  var copyLabel = document.getElementById('copy-contact-label');
  if (copyBtn && copyLabel) {
    copyBtn.addEventListener('click', function () {
      var user = copyBtn.getAttribute('data-u') || '';
      var domain = copyBtn.getAttribute('data-d') || '';
      if (!user || !domain || !navigator.clipboard) {
        return;
      }
      var addr = user + '@' + domain;
      navigator.clipboard.writeText(addr).then(function () {
        copyBtn.classList.add('is-copied');
        copyLabel.textContent = 'Copied';
        window.setTimeout(function () {
          copyBtn.classList.remove('is-copied');
          copyLabel.textContent = 'Copy';
        }, 2000);
      }).catch(function () {});
    });
  }

  // 4. Blog category & search filter
  var filterPills = document.querySelectorAll('[data-filter-category]');
  var searchInput = document.getElementById('blog-search-input');
  var postCards = document.querySelectorAll('[data-post-card]');
  var emptyState = document.getElementById('blog-empty-state');
  var activeCategory = 'all';

  function applyBlogFilter() {
    if (!postCards.length) {
      return;
    }
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visibleCount = 0;

    postCards.forEach(function (card) {
      var cat = card.getAttribute('data-category') || '';
      var text = (card.textContent || '').toLowerCase();
      var matchesCat = activeCategory === 'all' || cat === activeCategory;
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var show = matchesCat && matchesQuery;
      card.hidden = !show;
      if (show) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }

  if (filterPills.length) {
    filterPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        activeCategory = pill.getAttribute('data-filter-category') || 'all';
        filterPills.forEach(function (p) {
          p.classList.toggle('is-active', p === pill);
          p.setAttribute('aria-pressed', p === pill ? 'true' : 'false');
        });
        applyBlogFilter();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyBlogFilter);
  }

  // 5. Custom HTML5 Audio Player (Caffeine Mode)
  var audioEl = document.getElementById('post-audio');
  var playBtn = document.getElementById('audio-play-btn');
  var playIcon = document.getElementById('audio-icon-play');
  var pauseIcon = document.getElementById('audio-icon-pause');
  var rangeEl = document.getElementById('audio-range');
  var timeEl = document.getElementById('audio-time');

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) {
      return '0:00';
    }
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  function syncPlayState(playing) {
    if (playIcon && pauseIcon) {
      playIcon.hidden = playing;
      pauseIcon.hidden = !playing;
    }
    if (playBtn) {
      playBtn.setAttribute('aria-label', playing ? 'Pause Caffeine Mode' : 'Play Caffeine Mode');
    }
  }

  if (audioEl && playBtn && rangeEl && timeEl) {
    playBtn.addEventListener('click', function () {
      if (audioEl.paused) {
        audioEl.play().catch(function () {});
      } else {
        audioEl.pause();
      }
    });

    audioEl.addEventListener('play', function () { syncPlayState(true); });
    audioEl.addEventListener('pause', function () { syncPlayState(false); });
    audioEl.addEventListener('ended', function () { syncPlayState(false); });

    audioEl.addEventListener('loadedmetadata', function () {
      timeEl.textContent = '0:00 / ' + formatTime(audioEl.duration);
    });

    audioEl.addEventListener('timeupdate', function () {
      var dur = audioEl.duration || 98;
      var pct = (audioEl.currentTime / dur) * 100;
      rangeEl.value = String(pct);
      timeEl.textContent = formatTime(audioEl.currentTime) + ' / ' + formatTime(dur);
    });

    rangeEl.addEventListener('input', function () {
      var dur = audioEl.duration || 98;
      audioEl.currentTime = ( parseFloat(rangeEl.value) / 100 ) * dur;
    });
  }

  // 6. Accessible Image Lightbox (for figures and NYC bakery/cafe galleries)
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var zoomables = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-src]'));
  var currentIndex = -1;

  function openLightbox(index) {
    if (!lightbox || !lightboxImg || index < 0 || index >= zoomables.length) {
      return;
    }
    currentIndex = index;
    var item = zoomables[index];
    var src = item.getAttribute('data-lightbox-src') || '';
    var alt = item.getAttribute('data-lightbox-caption') || item.getAttribute('alt') || '';
    lightboxImg.setAttribute('src', src);
    lightboxImg.setAttribute('alt', alt);
    if (lightboxCaption) {
      lightboxCaption.textContent = alt;
    }
    if (lightboxPrev && lightboxNext) {
      var multi = zoomables.length > 1;
      lightboxPrev.hidden = !multi;
      lightboxNext.hidden = !multi;
    }
    lightbox.hidden = false;
    document.body.classList.add('is-modal-open');
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }
    lightbox.hidden = true;
    document.body.classList.remove('is-modal-open');
    if (lightboxImg) {
      lightboxImg.setAttribute('src', '');
    }
  }

  if (zoomables.length && lightbox) {
    zoomables.forEach(function (el, idx) {
      el.addEventListener('click', function () {
        openLightbox(idx);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', function (e) {
        e.stopPropagation();
        openLightbox((currentIndex - 1 + zoomables.length) % zoomables.length);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', function (e) {
        e.stopPropagation();
        openLightbox((currentIndex + 1) % zoomables.length);
      });
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) {
        return;
      }
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && zoomables.length > 1) {
        openLightbox((currentIndex - 1 + zoomables.length) % zoomables.length);
      } else if (e.key === 'ArrowRight' && zoomables.length > 1) {
        openLightbox((currentIndex + 1) % zoomables.length);
      }
    });
  }
})();
