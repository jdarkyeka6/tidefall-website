const fs = require('fs');
const path = require('path');

const PART_FILES = Array.from({ length: 33 }, (_, i) =>
  path.join(__dirname, 'booksource', `part-${String(i + 1).padStart(3, '0')}.txt`)
);

function readBook() {
  const text = PART_FILES.map(file => fs.readFileSync(file, 'utf8')).join('').replace(/\r\n?/g, '\n');
  if (!text.includes('CHAPTER ONE\nTHE WATER WITHOUT A SKY')) throw new Error('First chapter missing.');
  if (!text.includes('CHAPTER ONE HUNDRED TWENTY\nTHE FIRST YEAR')) throw new Error('Final chapter missing.');
  return text;
}

function parseChapters(text) {
  const chapters = [];
  const re = /^CHAPTER ([^\n]+)\n([^\n]+)\n([\s\S]*?)(?=^CHAPTER [^\n]+\n|$)/gm;
  let m;
  while ((m = re.exec(text))) chapters.push({ numberWord:m[1].trim(), title:m[2].trim(), body:m[3].trim() });
  return chapters;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function paragraphs(body) {
  return body.split(/\n\s*\n/).filter(Boolean).map(p => `<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
}

module.exports = function handler(req, res) {
  try {
    const chapters = parseChapters(readBook());
    if (chapters.length !== 120) throw new Error(`Expected 120 chapters, found ${chapters.length}.`);
    const raw = Number(req.query && req.query.chapter);
    const n = Number.isFinite(raw) ? Math.max(1, Math.min(120, Math.floor(raw))) : 1;
    const i = n - 1;
    const chapter = chapters[i];
    const base = '/books';
    const options = chapters.map((c, x) => `<option value="${x+1}"${x===i?' selected':''}>Chapter ${x+1} — ${esc(c.title)}</option>`).join('');
    const toc = chapters.map((c,x)=>`<a${x===i?' class="active"':''} href="${base}?chapter=${x+1}#reader">${String(x+1).padStart(3,'0')} ${esc(c.title)}</a>`).join('');
    const prev = i > 0 ? `${base}?chapter=${n-1}#reader` : '';
    const next = i < 119 ? `${base}?chapter=${n+1}#reader` : '';

    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=120, stale-while-revalidate=600');
    res.status(200).send(`<!doctype html><html lang="en-AU"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#07131f">
<title>Chapter ${n}: ${esc(chapter.title)} | Tidefall Book One</title><meta name="description" content="Read Tidefall Book One, The Listening Tide, online. Complete 120-chapter reader.">
<link rel="canonical" href="https://www.tidefall.com.au/books"><link rel="stylesheet" href="/styles.css">
<style>
:root{--paper:#f3eee2;--ink:#20282b;--muted:#687477;--rule:rgba(27,42,46,.15)}*{box-sizing:border-box}body{margin:0;background:#06111b}.book-hero{min-height:58svh;padding:120px clamp(20px,6vw,90px) 70px;display:grid;grid-template-columns:minmax(210px,300px) minmax(0,1fr);gap:clamp(35px,7vw,90px);align-items:center;background:radial-gradient(circle at 18% 20%,rgba(103,192,214,.14),transparent 26%),linear-gradient(180deg,#071722,#041019)}.book-cover{aspect-ratio:2/3;padding:30px 22px;border:1px solid rgba(211,239,245,.2);border-radius:5px 18px 18px 5px;background:radial-gradient(circle at 55% 18%,rgba(119,211,232,.19),transparent 27%),linear-gradient(155deg,#173d52,#07131f 61%,#02090d);box-shadow:-14px 28px 70px rgba(0,0,0,.42);display:flex;flex-direction:column;justify-content:space-between;text-align:center;font-family:Cinzel,Georgia,serif}.book-cover small{letter-spacing:.24em}.book-cover strong{font-size:clamp(1.8rem,4vw,3rem);line-height:.94}.book-cover span{letter-spacing:.2em;color:#b9e1e9}.book-intro h1{font-family:Cinzel,Georgia,serif;font-size:clamp(3.1rem,8vw,7rem);line-height:.9;margin:16px 0 22px}.book-intro h1 span{display:block;color:#a9d9e3;font-size:.44em}.book-intro p{max-width:650px;color:rgba(255,255,255,.7);line-height:1.75}.reader-zone{background:var(--paper);color:var(--ink);min-height:100vh}.reader-shell{width:min(1280px,100%);margin:auto;display:grid;grid-template-columns:280px minmax(0,760px);gap:clamp(32px,6vw,80px);justify-content:center;padding:65px clamp(18px,5vw,65px) 100px}.reader-sidebar{position:sticky;top:90px;height:max-content;padding-right:24px;border-right:1px solid var(--rule)}.reader-sidebar h2{font-family:Cinzel,Georgia,serif;font-size:2rem}.chapter-select{width:100%;padding:13px 10px;background:#fffdf7;border:1px solid var(--rule);color:var(--ink);font-size:16px}.reader-progress{color:var(--muted);font-size:.84rem}.reader-nav,.reader-bottom-nav{display:grid;grid-template-columns:1fr 1fr;gap:8px}.reader-nav{margin-top:18px}.reader-nav a,.reader-bottom-nav a{border:1px solid var(--rule);color:var(--ink);min-height:46px;font-weight:700;display:flex;align-items:center;padding:10px 14px;text-decoration:none}.reader-nav a:last-child,.reader-bottom-nav a:last-child{justify-content:flex-end}.reader-nav .disabled{opacity:.3;pointer-events:none}.toc-toggle{margin-top:24px;width:100%;text-align:left;border:0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:14px 0;background:none;font:inherit;font-weight:700;color:var(--ink)}.toc{display:none;max-height:46vh;overflow:auto}.toc.open{display:block}.toc a{display:block;padding:8px 0;color:var(--muted);text-decoration:none;font-size:.84rem}.toc a.active{color:var(--ink);font-weight:800}.chapter-number{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:#668087;font-weight:800}.chapter-heading{font-family:Cinzel,Georgia,serif;font-size:clamp(2.4rem,6vw,5rem);line-height:1;margin:13px 0 42px}.reader-copy{font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.05rem,1.5vw,1.18rem);line-height:1.88;color:#253034;user-select:none}.reader-copy p{margin:0 0 1.4em}.reader-copy p:first-child:first-letter{float:left;font-family:Cinzel,Georgia,serif;font-size:4.2em;line-height:.78;padding:9px 10px 0 0;color:#173d48}.reader-bottom-nav{margin-top:60px;padding-top:24px;border-top:1px solid var(--rule)}
@media(max-width:850px){.book-hero{grid-template-columns:1fr;text-align:center;padding-top:105px}.book-cover{width:min(250px,64vw);margin:auto}.book-intro h1{font-size:clamp(3rem,14vw,5rem)}.reader-shell{grid-template-columns:1fr;padding-top:38px}.reader-sidebar{position:relative;top:auto;border-right:0;border-bottom:1px solid var(--rule);padding:0 0 28px}.toc{max-height:55vh}}
@media(max-width:560px){.book-hero{min-height:auto;padding:92px 22px 55px}.book-cover{display:none}.book-intro p{font-size:.95rem}.reader-shell{padding:34px 20px 80px}.reader-sidebar h2{font-size:2.15rem}.chapter-heading{font-size:2.65rem;margin-bottom:30px}.reader-copy{font-size:1.08rem;line-height:1.78}.reader-bottom-nav{grid-template-columns:1fr}.site-header{padding-left:18px!important;padding-right:18px!important}}
</style></head><body>
<header class="site-header"><a class="brand" href="/"><span class="brand-mark">◌</span><span>TIDEFALL</span></a><button class="nav-toggle" type="button" aria-expanded="false">MENU</button><nav class="nav-links"><a href="/">Home</a><a href="/start-here">Start Here</a><a href="/explore">Explore</a><a href="/academy">Academy</a><a href="/students">Characters</a><a href="/books" aria-current="page">Books</a><a href="/lore">Lore</a><a href="/spells">Spells</a></nav></header>
<main><section class="book-hero"><div class="book-cover"><small>TIDEFALL</small><strong>THE<br>LISTENING<br>TIDE</strong><span>BOOK ONE</span></div><div class="book-intro"><div class="eyebrow">COMPLETE BOOK ONE · 120 CHAPTERS</div><h1>Tidefall<span>The Listening Tide</span></h1><p>Jasper Holloway arrives at Tidefall Academy expecting to learn magic. Instead, the sea notices him back.</p><a class="button primary" href="#reader">Start reading</a></div></section>
<section id="reader" class="reader-zone"><div class="reader-shell"><aside class="reader-sidebar"><p class="eyebrow">THE LISTENING TIDE</p><h2>Book One</h2><label class="chapter-number" for="chapterSelect">Jump to chapter</label><select id="chapterSelect" class="chapter-select" onchange="location.href='/books?chapter='+this.value+'#reader'">${options}</select><p class="reader-progress">Chapter ${n} of 120 · Your chapter is in the URL, so it works across refreshes.</p><div class="reader-nav"><a class="${prev?'':'disabled'}" href="${prev||'#reader'}">← Previous</a><a class="${next?'':'disabled'}" href="${next||'#reader'}">Next →</a></div><button id="tocToggle" class="toc-toggle" type="button">All chapters +</button><div id="toc" class="toc">${toc}</div></aside><article><div class="chapter-number">Chapter ${n} of 120</div><h2 class="chapter-heading">${esc(chapter.title)}</h2><div class="reader-copy protected-reader">${paragraphs(chapter.body)}</div><div class="reader-bottom-nav"><a class="${prev?'':'disabled'}" href="${prev||'#reader'}">← Previous chapter</a><a class="${next?'':'disabled'}" href="${next||'#reader'}">Next chapter →</a></div></article></div></section></main>
<footer class="site-footer"><div><strong>TIDEFALL</strong><p>The official home of the Tidefall fantasy universe.</p></div></footer>
<script src="/site-ui.js" defer></script><script>document.getElementById('tocToggle').onclick=function(){const t=document.getElementById('toc');const o=t.classList.toggle('open');this.textContent=o?'All chapters −':'All chapters +'};</script>
</body></html>`);
  } catch (error) {
    console.error('Book reader server error', error);
    res.status(500).setHeader('Content-Type','text/plain; charset=utf-8');
    res.end('Book One reader failed to build: '+error.message);
  }
};