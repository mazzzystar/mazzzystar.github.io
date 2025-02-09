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

  // Language switcher
  const switchBtn = document.querySelector('.lang-switch');
  if (switchBtn) {
    switchBtn.addEventListener('click', function() {
      const currentLang = localStorage.getItem('blog_language') || 'zh';
      const newLang = currentLang === 'zh' ? 'en' : 'zh';
      localStorage.setItem('blog_language', newLang);
      updateLanguageDisplay();
      updateSwitchButton();
    });

    // Initial language setup
    updateLanguageDisplay();
    updateSwitchButton();
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
  nav.onclick = function(){
    if (isMobileNavAnim) return;

    startMobileNavAnim();
    $container.toggleClass('mobile-nav-on');
    stopMobileNavAnim();
  };

  var wrap = document.getElementById('wrap');
  wrap.onclick = function(){
    if (isMobileNavAnim || !$container.hasClass('mobile-nav-on')) return;

    $container.removeClass('mobile-nav-on');
  };

  // code block copy button
  var codes = document.getElementsByClassName('code');
  for (var i = 0; i < codes.length; ++i) {
    var copy_button = document.createElement('div');
    copy_button.className = "copy-button";
    copy_button.innerHTML = "Copy";
    new ClipboardJS('.copy-button', {
      target: (trigger) => {
        return trigger.nextSibling;
      }
    });
    copy_button.onclick = (e) => {
      var btn = e.target;
      btn.innerHTML = "Copied!";
      setTimeout(function() {
        btn.innerHTML = "Copy";
      }, 1000);
    }
    codes[i].parentElement.insertBefore(copy_button, codes[i]);
  }
});

function updateLanguageDisplay() {
  const currentLang = localStorage.getItem('blog_language') || 'zh';
  document.querySelectorAll('.archive-article').forEach(article => {
    const articleLang = article.getAttribute('data-lang');
    article.style.display = articleLang === currentLang ? '' : 'none';
  });
}

function updateSwitchButton() {
  const switchBtn = document.querySelector('.lang-switch');
  if (switchBtn) {
    switchBtn.textContent = (localStorage.getItem('blog_language') || 'zh') === 'zh' ? 'EN' : '中文';
  }
}