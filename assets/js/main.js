/* ==========================================================================
   Wei Xia — Static Website Interactions v2 (Zero unsafe DOM sinks, CSP clean)
   ========================================================================== */

(function () {
  'use strict';

  // 1. Mobile navigation menu
  var menuBtn = document.getElementById('menu-toggle');
  var siteNav = document.getElementById('site-nav');
  if (menuBtn && siteNav) {
    menuBtn.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // 3. Reading progress bar & Sticky TOC active section observer
  var progressEl = document.getElementById('reading-progress');
  if (progressEl) {
    var ticking = false;
    var updateProgress = function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      progressEl.value = pct;
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();
  }

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('[data-toc-link]'));
  if (tocLinks.length) {
    var headings = [];
    tocLinks.forEach(function (link) {
      var id = (link.getAttribute('href') || '').replace('#', '');
      var target = id ? document.getElementById(id) : null;
      if (target) {
        headings.push(target);
      }
    });

    var setActiveToc = function (activeId) {
      tocLinks.forEach(function (link) {
        var isMatch = link.getAttribute('href') === '#' + activeId;
        link.classList.toggle('is-active', isMatch);
      });
    };

    var tocTicking = false;
    var updateActiveToc = function () {
      if (!headings.length) {
        tocTicking = false;
        return;
      }
      var scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      var atBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 40);
      var currentId = headings[0].id;
      if (atBottom) {
        currentId = headings[headings.length - 1].id;
      } else {
        var threshold = scrollY + 140;
        for (var i = 0; i < headings.length; i++) {
          var top = headings[i].getBoundingClientRect().top + scrollY;
          if (top <= threshold) {
            currentId = headings[i].id;
          }
        }
      }
      setActiveToc(currentId);
      tocTicking = false;
    };

    window.addEventListener('scroll', function () {
      if (!tocTicking) {
        window.requestAnimationFrame(updateActiveToc);
        tocTicking = true;
      }
    }, { passive: true });
    updateActiveToc();
  }

  // 4. Blog category & search filter
  var filterPills = document.querySelectorAll('[data-filter-category]');
  var searchInput = document.getElementById('blog-search-input');
  var postCards = document.querySelectorAll('[data-post-card]');
  var emptyState = document.getElementById('blog-empty-state');
  var activeCategory = document.body.getAttribute('data-initial-category') || 'all';

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
      var cat = pill.getAttribute('data-filter-category') || 'all';
      var isInitial = cat === activeCategory;
      pill.classList.toggle('is-active', isInitial);
      pill.setAttribute('aria-pressed', isInitial ? 'true' : 'false');

      pill.addEventListener('click', function () {
        activeCategory = cat;
        filterPills.forEach(function (p) {
          p.classList.toggle('is-active', p === pill);
          p.setAttribute('aria-pressed', p === pill ? 'true' : 'false');
        });
        applyBlogFilter();
      });
    });
    applyBlogFilter();
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyBlogFilter);
  }

  // 5. Blog post like heart button (starts at 5 likes per post, persisted locally)
  var likeBtns = Array.prototype.slice.call(document.querySelectorAll('[data-like-post]'));
  function getLikedState(postKey) {
    try {
      return window.localStorage.getItem('wx_liked_' + postKey) === '1';
    } catch (err) {
      return false;
    }
  }

  function setLikedState(postKey, liked) {
    try {
      if (liked) {
        window.localStorage.setItem('wx_liked_' + postKey, '1');
      } else {
        window.localStorage.removeItem('wx_liked_' + postKey);
      }
    } catch (err) {}
  }

  function renderLikeBtn(btn, liked) {
    var base = parseInt(btn.getAttribute('data-base-likes') || '5', 10);
    var count = base + (liked ? 1 : 0);
    var countEl = btn.querySelector('.like-count');
    var outlineIcon = btn.querySelector('.heart-outline');
    var filledIcon = btn.querySelector('.heart-filled');
    if (countEl) {
      countEl.textContent = String(count);
    }
    if (outlineIcon && filledIcon) {
      outlineIcon.hidden = liked;
      filledIcon.hidden = !liked;
    }
    btn.classList.toggle('is-liked', liked);
    btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    btn.setAttribute('aria-label', (liked ? 'Unlike post (' : 'Like post (') + count + ' likes)');
  }

  if (likeBtns.length) {
    likeBtns.forEach(function (btn) {
      var key = btn.getAttribute('data-like-post') || '';
      renderLikeBtn(btn, getLikedState(key));
      btn.addEventListener('click', function () {
        var nextLiked = !btn.classList.contains('is-liked');
        setLikedState(key, nextLiked);
        likeBtns.forEach(function (other) {
          if (other.getAttribute('data-like-post') === key) {
            renderLikeBtn(other, nextLiked);
          }
        });
      });
    });
  }

  // 6. Custom HTML5 Audio Player with <progress> scrubber (Caffeine Mode)
  var audioEl = document.getElementById('post-audio');
  var playBtn = document.getElementById('audio-play-btn');
  var playIcon = document.getElementById('audio-icon-play');
  var pauseIcon = document.getElementById('audio-icon-pause');
  var scrubWrap = document.getElementById('audio-scrub');
  var audioProgress = document.getElementById('audio-progress');
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

  if (audioEl && playBtn && scrubWrap && audioProgress && timeEl) {
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
      var pct = Math.min(100, Math.max(0, (audioEl.currentTime / dur) * 100));
      audioProgress.value = pct;
      scrubWrap.setAttribute('aria-valuenow', String(Math.round(pct)));
      timeEl.textContent = formatTime(audioEl.currentTime) + ' / ' + formatTime(dur);
    });

    scrubWrap.addEventListener('click', function (e) {
      var rect = scrubWrap.getBoundingClientRect();
      if (rect.width <= 0) {
        return;
      }
      var ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      var dur = audioEl.duration || 98;
      audioEl.currentTime = ratio * dur;
      audioProgress.value = ratio * 100;
    });

    scrubWrap.addEventListener('keydown', function (e) {
      var dur = audioEl.duration || 98;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        audioEl.currentTime = Math.min(dur, audioEl.currentTime + 5);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        audioEl.currentTime = Math.max(0, audioEl.currentTime - 5);
      }
    });
  }

  // 7. Accessible Image Lightbox with Counter
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
      var prefix = zoomables.length > 1 ? '(' + (index + 1) + ' / ' + zoomables.length + ')  ' : '';
      lightboxCaption.textContent = prefix + alt;
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

  // 8. WeChat QR Code Modal (lazy-loads QR image on click, accessible keyboard/backdrop close)
  var qrBtn = document.getElementById('wechat-qr-btn');
  var qrModal = document.getElementById('qr-modal');
  var qrImg = document.getElementById('qr-modal-img');
  var qrClose = document.getElementById('qr-modal-close');

  if (qrBtn && qrModal && qrImg) {
    var openQrModal = function () {
      var src = qrBtn.getAttribute('data-qr-src') || '';
      if (src && !qrImg.getAttribute('src')) {
        qrImg.setAttribute('src', src);
      }
      qrModal.hidden = false;
      document.body.classList.add('is-modal-open');
      if (qrClose) {
        qrClose.focus();
      }
    };

    var closeQrModal = function () {
      if (qrModal.hidden) {
        return;
      }
      qrModal.hidden = true;
      document.body.classList.remove('is-modal-open');
      qrBtn.focus();
    };

    qrBtn.addEventListener('click', openQrModal);
    if (qrClose) {
      qrClose.addEventListener('click', closeQrModal);
    }
    qrModal.addEventListener('click', function (e) {
      if (e.target === qrModal) {
        closeQrModal();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !qrModal.hidden) {
        closeQrModal();
      }
    });
  }
})();
