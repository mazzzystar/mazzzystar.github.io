// Vanilla JS — no jQuery. Image lightbox, mobile nav, table wrapping,
// code block toolbar (fold/copy), X embed loading.
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ---------- Image lightbox (replaces fancybox) ---------- */
  var overlay = null;

  function closeLightbox() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', onLightboxKey);
  }

  function onLightboxKey(e) {
    if (e.key === 'Escape') closeLightbox();
  }

  function openLightbox(src, alt) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lightbox';
      overlay.innerHTML = '<img alt="">';
      overlay.addEventListener('click', closeLightbox);
      document.body.appendChild(overlay);
    }
    var img = overlay.querySelector('img');
    img.src = src;
    img.alt = alt || '';
    // double rAF so the transition plays on first open
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('is-open');
      });
    });
    document.addEventListener('keydown', onLightboxKey);
  }

  document.querySelectorAll('.article-entry img').forEach(function (img) {
    if (img.closest('a')) return; // linked images keep their link
    img.classList.add('zoomable');
    img.addEventListener('click', function () {
      openLightbox(img.currentSrc || img.src, img.alt);
    });
  });

  /* ---------- Mobile nav ---------- */
  var container = document.getElementById('container');
  var navToggle = document.getElementById('main-nav-toggle');
  var wrap = document.getElementById('wrap');

  if (navToggle && container) {
    navToggle.addEventListener('click', function () {
      container.classList.toggle('mobile-nav-on');
    });
  }
  if (wrap && container) {
    wrap.addEventListener('click', function () {
      container.classList.remove('mobile-nav-on');
    });
  }

  /* ---------- Wrap raw HTML tables so they stay readable ---------- */
  document.querySelectorAll('.article-entry table').forEach(function (table) {
    if (table.parentElement.classList.contains('table-scroll')) return;
    if (table.closest('.table-scroll')) return;
    var scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    table.parentNode.insertBefore(scroll, table);
    scroll.appendChild(table);
  });

  /* ---------- Code blocks: ghost copy button + quiet expand bar ---------- */
  function getCodeText(block) {
    var code = block.querySelector('pre code');
    return code ? code.innerText : '';
  }

  function setupCodeBlock(block) {
    if (!block.querySelector('pre')) return;
    block.classList.add('code-block');

    if (!block.querySelector('.copy-button')) {
      var copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.type = 'button';
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(getCodeText(block));
        copyButton.textContent = 'Copied';
        setTimeout(function () {
          copyButton.textContent = 'Copy';
        }, 1000);
      });
      block.appendChild(copyButton);
    }

    // fence-flagged collapsed blocks get a quiet "lang ▸" bar
    var collapsed = block.classList.contains('is-collapsed') ||
      block.getAttribute('data-code-fold') === 'collapsed';
    if (collapsed && !block.querySelector('.code-expand-bar')) {
      var lang = block.getAttribute('data-code-lang') || 'code';
      var bar = document.createElement('button');
      bar.className = 'code-expand-bar';
      bar.type = 'button';
      block.classList.add('is-collapsed');
      bar.textContent = lang + ' \u25B8';
      bar.addEventListener('click', function () {
        var nowCollapsed = block.classList.toggle('is-collapsed');
        bar.textContent = lang + (nowCollapsed ? ' \u25B8' : ' \u25BE');
      });
      block.insertBefore(bar, block.firstChild);
    }
  }

  document.querySelectorAll('.article-entry .highlight').forEach(function (block) {
    if (block.closest('.gist')) return;
    setupCodeBlock(block);
  });

  /* ---------- X (Twitter) embeds ---------- */
  function syncTweetEmbeds() {
    document.querySelectorAll('.x-embed-card').forEach(function (card) {
      if (card.querySelector('iframe.twitter-tweet-rendered, iframe[id^="twitter-widget-"]')) {
        card.classList.add('is-rendered');
      }
    });
  }

  function loadTwitterWidgets() {
    if (!document.querySelector('.twitter-tweet')) return;

    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(document.body);
      syncTweetEmbeds();
      return;
    }

    if (!document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
      var script = document.createElement('script');
      script.async = true;
      script.charset = 'utf-8';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.onload = function () {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load(document.body);
        }
        setTimeout(syncTweetEmbeds, 1000);
      };
      document.body.appendChild(script);
    }

    setTimeout(syncTweetEmbeds, 2000);
    setTimeout(syncTweetEmbeds, 5000);
  }

  loadTwitterWidgets();

  /* ---------- Thoughts: load previous year in place ---------- */
  var moreBtn = document.querySelector('.thoughts-more');
  if (moreBtn) {
    var thoughtYears = (moreBtn.dataset.years || '').split(',');
    moreBtn.addEventListener('click', function () {
      var next = moreBtn.dataset.next;
      if (!next) return;
      moreBtn.disabled = true;
      moreBtn.textContent = '\u2026';
      fetch('/thoughts/' + next + '/')
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var entry = document.querySelector('.article-type-thoughts .article-entry');
          var divider = document.createElement('div');
          divider.className = 'thoughts-year-divider';
          divider.innerHTML = '<span>' + next + '</span>';
          entry.appendChild(divider);
          doc.querySelectorAll('.article-entry .thought').forEach(function (n) {
            entry.appendChild(n);
          });
          var after = thoughtYears[thoughtYears.indexOf(next) + 1];
          if (after) {
            moreBtn.dataset.next = after;
            moreBtn.textContent = '\u2193 ' + after;
            moreBtn.disabled = false;
          } else {
            moreBtn.remove();
          }
        })
        .catch(function () {
          moreBtn.disabled = false;
          moreBtn.textContent = '\u2193 ' + next;
        });
    });
  }
});
