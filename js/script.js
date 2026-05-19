$(document).ready(function() {
  // Initialize fancybox for images
  $('.article-entry').each(function(i) {
    $(this).find('img').each(function() {
      if ($(this).parent().hasClass('fancybox') || $(this).parent().is('a')) return;
      
      var alt = this.alt;
      if (alt) $(this).after('<span class="caption">' + alt + '</span>');

      $(this).wrap('<a class="fancybox" rel="gallery' + i + '" href="' + this.src + '" title="' + alt + '"></a>');
    });
  });

  // Initialize fancybox with modern browser check
  if (typeof $.fn.fancybox === 'function') {
    $('.fancybox').fancybox({
      openEffect: 'elastic',
      closeEffect: 'elastic'
    });
  }

  // Mobile nav
  var $container = $('#container'),
    isMobileNavAnim = false,
    mobileNavAnimDuration = 200;

  var startMobileNavAnim = function(){
    isMobileNavAnim = true;
  };

  var stopMobileNavAnim = function(){
    setTimeout(function(){
      isMobileNavAnim = false;
    }, mobileNavAnimDuration);
  }

  var nav = document.getElementById('main-nav-toggle');
  if (nav) {
    nav.onclick = function(){
      if (isMobileNavAnim) return;

      startMobileNavAnim();
      $container.toggleClass('mobile-nav-on');
      stopMobileNavAnim();
    };
  }

  var wrap = document.getElementById('wrap');
  if (wrap) {
    wrap.onclick = function(){
      if (isMobileNavAnim || !$container.hasClass('mobile-nav-on')) return;

      $container.removeClass('mobile-nav-on');
    };
  }

  // Keep legacy/raw HTML tables readable when they are not emitted by markdown.
  $('.article-entry table').each(function() {
    if ($(this).parent().hasClass('table-scroll')) return;
    $(this).wrap('<div class="table-scroll"></div>');
  });

  function getCodeText(block) {
    var code = block.querySelector('pre code');
    return code ? code.innerText : '';
  }

  function setFoldState(block, collapsed) {
    var toggle = block.querySelector('.code-fold-toggle');
    block.classList.toggle('is-collapsed', collapsed);
    block.setAttribute('data-code-fold', collapsed ? 'collapsed' : 'open');

    if (toggle) {
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggle.innerHTML = collapsed ? 'Expand' : 'Collapse';
    }
  }

  function ensureCodeToolbar(block) {
    if (!block.querySelector('pre')) return;

    block.classList.add('code-block');

    if (!block.querySelector('.code-block-toolbar')) {
      var lang = block.getAttribute('data-code-lang') || 'text';
      var toolbar = document.createElement('div');
      toolbar.className = 'code-block-toolbar';
      toolbar.innerHTML = '<span class="code-block-lang">' + lang + '</span>' +
        '<div class="code-block-actions">' +
        '<button class="code-fold-toggle" type="button" aria-expanded="true">Collapse</button>' +
        '<button class="copy-button" type="button">Copy</button>' +
        '</div>';
      block.insertBefore(toolbar, block.firstChild);
    }

    var toggle = block.querySelector('.code-fold-toggle');
    if (toggle && !toggle.getAttribute('data-bound')) {
      toggle.setAttribute('data-bound', 'true');
      toggle.onclick = function() {
        setFoldState(block, !block.classList.contains('is-collapsed'));
      };
    }

    var copyButton = block.querySelector('.copy-button');
    if (copyButton && !copyButton.getAttribute('data-bound')) {
      copyButton.setAttribute('data-bound', 'true');

      if (typeof ClipboardJS === 'function') {
        new ClipboardJS(copyButton, {
          text: function() {
            return getCodeText(block);
          }
        });
      }

      copyButton.onclick = function() {
        if (typeof ClipboardJS !== 'function' && navigator.clipboard) {
          navigator.clipboard.writeText(getCodeText(block));
        }

        copyButton.innerHTML = 'Copied!';
        setTimeout(function() {
          copyButton.innerHTML = 'Copy';
        }, 1000);
      };
    }

    setFoldState(block, block.classList.contains('is-collapsed') || block.getAttribute('data-code-fold') === 'collapsed');
  }

  var codeBlocks = document.querySelectorAll('.article-entry .highlight');
  for (var i = 0; i < codeBlocks.length; ++i) {
    if ($(codeBlocks[i]).closest('.gist').length) continue;
    ensureCodeToolbar(codeBlocks[i]);
  }

  function syncTweetEmbeds() {
    var cards = document.querySelectorAll('.x-embed-card');
    for (var i = 0; i < cards.length; ++i) {
      if (cards[i].querySelector('iframe.twitter-tweet-rendered, iframe[id^="twitter-widget-"]')) {
        cards[i].classList.add('is-rendered');
      }
    }
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
      script.onload = function() {
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
});
