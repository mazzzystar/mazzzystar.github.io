/* ZH-FONT-TEST: temporary Chinese font previewer (remove after decision).
 * Swaps the CJK body font while keeping the current system intact:
 * Latin stays Iowan; italic stays 楷体; bold is 黑体 unless the candidate
 * ships a native bold (marked in the list). */
(function () {
  'use strict';

  // [slug, label, hint]  — @font-face triplets live in zh-font-test.css
  var FONTS = [
    ['', '汉仪书宋二S（现用）', ''],
    // —— 书宋/正文宋 流派 ——
    ['fzshusong', '方正书宋', '你看中的那款'],
    ['fzbaosong', '方正报宋', '报纸正文，略瘦'],
    ['fzxinbaosong', '方正新报宋', '报宋现代修订版'],
    ['fzsongsan', '方正宋三', '比书宋略重'],
    ['stzhongsong', '华文中宋', '笔画偏粗，庄重'],
    // —— 雅宋/书刻风 ——
    ['fzzhongyasong', '方正中雅宋', '书卷气重，笔画有韵味'],
    ['fzzhunyasong', '方正准雅宋', '雅宋的正文字重'],
    ['fzyuesong', '方正清刻本悦宋', '仿清代刻本，最古典'],
    // —— 开源（可放心自托管）——
    ['notoserif', '思源宋体', '开源 · 自带真粗体'],
    ['lxgwwenkai', '霞鹜文楷', '开源楷体风 · 博客圈流行'],
    ['zhuque', '朱雀仿宋', '开源仿宋 · 文人气'],
    // —— 别的路子 ——
    ['fzfangsong', '方正仿宋', '仿宋做正文'],
    ['fzkaiti', '方正楷体', '楷体做正文']
  ];

  var STORE_KEY = 'zh_font_preview';

  function currentId() {
    return localStorage.getItem(STORE_KEY) || '';
  }

  function apply(id) {
    if (id) localStorage.setItem(STORE_KEY, id);
    else localStorage.removeItem(STORE_KEY);
    document.documentElement.dataset.zhFont = id;
    render();
  }

  function cycle(dir) {
    var ids = FONTS.map(function (f) { return f[0]; });
    var idx = ids.indexOf(currentId());
    apply(ids[(idx + dir + ids.length) % ids.length]);
    var active = panel.querySelector('.zfp-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  var css = [
    '#zfp-toggle { position: fixed; top: 10px; right: 10px; z-index: 9999;',
    '  background: rgba(20,20,20,.78); color: #fff; border: none; border-radius: 16px;',
    '  padding: 6px 12px; font-size: 12px; cursor: pointer; backdrop-filter: blur(6px); }',
    '#zfp-panel { position: fixed; top: 44px; right: 10px; z-index: 9999; width: 250px;',
    '  max-height: 74vh; overflow-y: auto; background: rgba(20,20,20,.92); color: #eee;',
    '  border-radius: 10px; font-size: 13px; padding: 6px 0 8px; backdrop-filter: blur(8px);',
    '  box-shadow: 0 4px 24px rgba(0,0,0,.35); display: none; }',
    '#zfp-panel.open { display: block; }',
    '.zfp-head { display: flex; gap: 4px; padding: 6px 10px; position: sticky; top: 0;',
    '  background: rgba(20,20,20,.97); }',
    '.zfp-head button { background: rgba(255,255,255,.12); color: #fff; border: none;',
    '  border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer; }',
    '.zfp-head button:hover { background: rgba(255,255,255,.25); }',
    '.zfp-item { display: block; width: 100%; text-align: left; background: none; border: none;',
    '  color: #eee; padding: 5px 12px; cursor: pointer; font-size: 13px; line-height: 1.35; }',
    '.zfp-item:hover { background: rgba(255,255,255,.12); }',
    '.zfp-item.active { background: #fff; color: #111; }',
    '.zfp-item .hint { display: block; font-size: 11px; opacity: .55; }'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var toggle = document.createElement('button');
  toggle.id = 'zfp-toggle';
  var panel = document.createElement('div');
  panel.id = 'zfp-panel';

  var head = document.createElement('div');
  head.className = 'zfp-head';
  [['‹ 上一个', function () { cycle(-1); }],
   ['下一个 ›', function () { cycle(1); }],
   ['还原', function () { apply(''); }]].forEach(function (b) {
    var btn = document.createElement('button');
    btn.textContent = b[0];
    btn.onclick = b[1];
    head.appendChild(btn);
  });
  panel.appendChild(head);

  FONTS.forEach(function (f) {
    var item = document.createElement('button');
    item.className = 'zfp-item';
    item.dataset.id = f[0];
    item.innerHTML = f[1] + (f[2] ? '<span class="hint">' + f[2] + '</span>' : '');
    item.onclick = function () { apply(f[0]); };
    panel.appendChild(item);
  });

  function render() {
    var id = currentId();
    var font = FONTS.filter(function (f) { return f[0] === id; })[0];
    toggle.textContent = '汉 · ' + (font && font[0] ? font[1] : '现用');
    panel.querySelectorAll('.zfp-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.id === id);
    });
  }

  toggle.onclick = function () { panel.classList.toggle('open'); };
  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  if (currentId()) document.documentElement.dataset.zhFont = currentId();
  render();
})();
