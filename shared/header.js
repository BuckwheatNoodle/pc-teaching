/* ── 共通ヘッダー注入スクリプト ── */
(function () {
  // スクリプト自身のパスからルートへの相対パスを算出
  var scripts = document.getElementsByTagName('script');
  var me = scripts[scripts.length - 1];
  var src = me.getAttribute('src') || '';
  var base = src.replace(/shared\/header\.js.*$/, '');

  var nav = [
    { label: '学ぶ',   icon: '\uD83D\uDCD6', href: base + 'index.html#learn' },
    { label: 'クイズ', icon: '\u2705',         href: base + 'index.html#quiz' },
    { label: 'ゲーム', icon: '\uD83C\uDFAE',   href: base + 'index.html#game' }
  ];

  // Build HTML
  var linksHtml = '';
  for (var i = 0; i < nav.length; i++) {
    linksHtml += '<li><a href="' + nav[i].href + '">' +
      '<span class="nav-icon">' + nav[i].icon + '</span>' +
      nav[i].label + '</a></li>';
  }

  var header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<div class="site-header-inner">' +
      '<a class="site-header-logo" href="' + base + 'index.html">\uD83D\uDDA5\uFE0F PC \u304D\u307B\u3093\u9053\u5834</a>' +
      '<button class="site-header-burger" aria-label="Menu">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
      '<ul class="site-header-nav">' + linksHtml + '</ul>' +
    '</div>';

  // Insert at top of body
  document.body.insertBefore(header, document.body.firstChild);
  document.body.classList.add('has-site-header');

  // Load CSS if not already present
  if (!document.querySelector('link[href*="shared/header.css"]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + 'shared/header.css';
    document.head.appendChild(link);
  }

  // Hamburger toggle
  var burger = header.querySelector('.site-header-burger');
  var navUl = header.querySelector('.site-header-nav');
  burger.addEventListener('click', function () {
    burger.classList.toggle('open');
    navUl.classList.toggle('open');
  });

  // Close drawer on link click (mobile)
  navUl.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      burger.classList.remove('open');
      navUl.classList.remove('open');
    }
  });
})();
