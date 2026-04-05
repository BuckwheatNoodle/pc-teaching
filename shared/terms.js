// ── 用語ツールチップシステム ──
(function() {
  let currentTip = null;

  function closeTip() {
    if (currentTip) {
      currentTip.remove();
      currentTip = null;
    }
  }

  function positionTip(tip, target) {
    const rect = target.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;

    // 画面外にはみ出さないように調整
    if (left < 8) left = 8;
    if (left + tipRect.width > window.innerWidth - 8) left = window.innerWidth - tipRect.width - 8;
    if (top + tipRect.height > window.innerHeight - 8) {
      top = rect.top - tipRect.height - 8;
    }

    tip.style.top = top + 'px';
    tip.style.left = left + 'px';
  }

  function showTip(term) {
    closeTip();

    const word = term.dataset.term || term.textContent;
    const reading = term.dataset.reading || '';
    const desc = term.dataset.tip || '';

    const tip = document.createElement('div');
    tip.className = 'term-tip';

    const readingHtml = reading ? '<span class="term-tip-reading">（' + reading + '）</span>' : '';
    const aiQuery = '「' + word + '」をプログラミング初心者の中学生にわかるように、簡単な例を使って説明して';

    tip.innerHTML =
      '<button class="term-tip-close" onclick="this.parentElement.remove()">✕</button>' +
      '<div class="term-tip-word">📖 ' + word + readingHtml + '</div>' +
      '<div class="term-tip-body">' + desc + '</div>' +
      '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;">' +
        '<a class="term-tip-ai" data-query="' + aiQuery.replace(/"/g, '&quot;') + '" onclick="copyAndOpenAI(this);return false;" href="#">💬 AIにもっと聞く</a>' +
        '<span class="term-tip-copied" id="tip-copied">✅ コピーしました！</span>' +
      '</div>';

    document.body.appendChild(tip);
    currentTip = tip;

    positionTip(tip, term);
  }

  // AIに聞くボタン
  window.copyAndOpenAI = function(btn) {
    const query = btn.dataset.query;

    // クリップボードにコピー
    navigator.clipboard.writeText(query).then(function() {
      const copied = btn.parentElement.querySelector('.term-tip-copied');
      if (copied) copied.style.display = 'inline';
      setTimeout(function() { if (copied) copied.style.display = 'none'; }, 2000);
    }).catch(function() {
      // フォールバック
      const ta = document.createElement('textarea');
      ta.value = query;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      const copied = btn.parentElement.querySelector('.term-tip-copied');
      if (copied) copied.style.display = 'inline';
      setTimeout(function() { if (copied) copied.style.display = 'none'; }, 2000);
    });

    // ChatGPTを開く
    window.open('https://chatgpt.com/', '_blank');
  };

  // クリックでツールチップ表示
  document.addEventListener('click', function(e) {
    const term = e.target.closest('.term');
    if (term) {
      e.preventDefault();
      showTip(term);
      return;
    }
    // ツールチップ外をクリックで閉じる
    if (currentTip && !e.target.closest('.term-tip')) {
      closeTip();
    }
  });

  // Escで閉じる
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeTip();
  });
})();
