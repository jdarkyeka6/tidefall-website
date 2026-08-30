const fs = require('fs');
const path = require('path');

const PART_FILES = Array.from({ length: 33 }, (_, i) =>
  path.join(__dirname, 'booksource', `part-${String(i + 1).padStart(3, '0')}.txt`)
);

function readBook() {
  const text = PART_FILES.map(file => fs.readFileSync(file, 'utf8')).join('');
  const normalized = text.replace(/\r\n?/g, '\n');
  if (!normalized.includes('CHAPTER ONE\nTHE WATER WITHOUT A SKY')) {
    throw new Error('Book One source does not begin with the expected first chapter.');
  }
  if (!normalized.includes('CHAPTER ONE HUNDRED TWENTY\nTHE FIRST YEAR')) {
    throw new Error('Book One source is incomplete: final chapter is missing.');
  }
  return normalized;
}

function parseChapters(text) {
  const chapters = [];
  const re = /^CHAPTER ([^\n]+)\n([^\n]+)\n([\s\S]*?)(?=^CHAPTER [^\n]+\n|$)/gm;
  let match;
  while ((match = re.exec(text))) {
    chapters.push({
      numberWord: match[1].trim(),
      title: match[2].trim(),
      body: match[3].trim()
    });
  }
  return chapters;
}

function safeJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

module.exports = function handler(req, res) {
  try {
    const source = readBook();
    const chapters = parseChapters(source);
    if (chapters.length !== 120) {
      throw new Error(`Book source loaded, but ${chapters.length} chapters were detected instead of 120.`);
    }

    const data = safeJson(chapters);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
    res.status(200).send(`<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#07131f">
<title>Tidefall: The Listening Tide | Read Book One</title>
<meta name="description" content="Read the complete official Tidefall Book One, The Listening Tide, across all 120 chapters.">
<link rel="canonical" href="https://www.tidefall.com.au/books"><link rel="stylesheet" href="/styles.css">
<style>
:root{--paper:#f3eee2;--ink:#20282b;--muted:#6c7779;--rule:rgba(27,42,46,.15)}body{background:#06111b}.book-hero{min-height:70svh;padding:130px clamp(20px,6vw,90px) 78px;display:grid;grid-template-columns:minmax(230px,330px) minmax(0,1fr);gap:clamp(38px,8vw,100px);align-items:center;background:radial-gradient(circle at 18% 20%,rgba(103,192,214,.14),transparent 26%),linear-gradient(180deg,#071722,#041019)}.book-cover{aspect-ratio:2/3;padding:34px 25px;border:1px solid rgba(211,239,245,.2);border-radius:5px 18px 18px 5px;background:radial-gradient(circle at 55% 18%,rgba(119,211,232,.19),transparent 27%),linear-gradient(155deg,#173d52,#07131f 61%,#02090d);box-shadow:-14px 28px 70px rgba(0,0,0,.42);display:flex;flex-direction:column;justify-content:space-between;text-align:center;font-family:Cinzel,Georgia,serif}.book-cover small{letter-spacing:.24em}.book-cover strong{font-size:clamp(2rem,4vw,3.2rem);line-height:.94}.book-cover span{letter-spacing:.2em;color:#b9e1e9}.book-intro h1{font-family:Cinzel,Georgia,serif;font-size:clamp(3.4rem,8vw,7.3rem);line-height:.89;margin:18px 0 24px}.book-intro h1 span{display:block;color:#a9d9e3;font-size:.45em}.book-intro p{max-width:680px;color:rgba(255,255,255,.68);line-height:1.8}.reader-zone{background:var(--paper);color:var(--ink);min-height:100vh}.reader-shell{width:min(1320px,100%);margin:auto;display:grid;grid-template-columns:280px minmax(0,760px);gap:clamp(34px,7vw,88px);justify-content:center;padding:70px clamp(18px,5vw,70px) 110px}.reader-sidebar{position:sticky;top:95px;height:max-content;padding-right:25px;border-right:1px solid var(--rule)}.reader-sidebar h2{font-family:Cinzel,Georgia,serif}.chapter-select{width:100%;padding:13px;background:#fffdf7;border:1px solid var(--rule);color:var(--ink)}.reader-progress{color:var(--muted);font-size:.82rem}.reader-nav{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:20px}.reader-nav button,.reader-bottom-nav button,.toc button{font:inherit}.reader-nav button,.reader-bottom-nav button{border:1px solid var(--rule);background:transparent;color:var(--ink);min-height:44px;font-weight:700}.toc-toggle{margin-top:24px;width:100%;text-align:left;border:0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:14px 0;background:none;font:inherit;font-weight:700}.toc{display:none;max-height:46vh;overflow:auto}.toc.open{display:block}.toc button{display:block;width:100%;border:0;background:none;text-align:left;padding:9px 0;color:var(--muted)}.toc button.active{color:var(--ink);font-weight:800}.chapter-number{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#668087;font-weight:800}.chapter-heading{font-family:Cinzel,Georgia,serif;font-size:clamp(2.6rem,6vw,5.2rem);line-height:.98;margin:14px 0 45px}.reader-copy{font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.05rem,1.5vw,1.18rem);line-height:1.88;color:#253034;user-select:none}.reader-copy p{margin:0 0 1.4em}.reader-copy p:first-child:first-letter{float:left;font-family:Cinzel,Georgia,serif;font-size:4.3em;line-height:.78;padding:9px 10px 0 0;color:#173d48}.reader-bottom-nav{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:65px;padding-top:25px;border-top:1px solid var(--rule)}.reader-bottom-nav button:last-child{text-align:right}.copy-warning{position:fixed;left:50%;bottom:25px;z-index:1000;transform:translate(-50%,16px);opacity:0;padding:11px 16px;border-radius:999px;background:#07131f;color:#fff;transition:.18s}.copy-warning.show{opacity:1;transform:translate(-50%,0)}@media(max-width:850px){.book-hero{grid-template-columns:1fr;text-align:center}.book-cover{width:min(285px,72vw);margin:auto}.reader-shell{grid-template-columns:1fr;padding-top:35px}.reader-sidebar{position:relative;top:auto;border-right:0;border-bottom:1px solid var(--rule);padding:0 0 28px}}@media(max-width:560px){.book-hero{padding-top:95px}.reader-bottom-nav{grid-template-columns:1fr}}
</style>
</head>
<body>
<header class="site-header"><a class="brand" href="/"><span class="brand-mark">◌</span><span>TIDEFALL</span></a><button class="nav-toggle" type="button" aria-expanded="false">MENU</button><nav class="nav-links"><a href="/">Home</a><a href="/start-here">Start Here</a><a href="/explore">Explore</a><a href="/academy">Academy</a><a href="/students">Characters</a><a href="/books" aria-current="page">Books</a><a href="/lore">Lore</a><a href="/spells">Spells</a></nav></header>
<main><section class="book-hero"><div class="book-cover"><small>TIDEFALL</small><strong>THE<br>LISTENING<br>TIDE</strong><span>BOOK ONE</span></div><div class="book-intro"><div class="eyebrow">COMPLETE BOOK ONE · 120 CHAPTERS</div><h1>Tidefall<span>The Listening Tide</span></h1><p>Jasper Holloway arrives at Tidefall Academy expecting to learn magic. Instead, the sea notices him back.</p><a class="button primary" href="#reader">Start reading</a></div></section>
<section id="reader" class="reader-zone"><div class="reader-shell"><aside class="reader-sidebar"><p class="eyebrow">THE LISTENING TIDE</p><h2>Book One</h2><label class="chapter-number" for="chapterSelect">Jump to chapter</label><select id="chapterSelect" class="chapter-select"></select><p id="progressCopy" class="reader-progress"></p><div class="reader-nav"><button id="prevTop">← Previous</button><button id="nextTop">Next →</button></div><button id="tocToggle" class="toc-toggle" type="button">All chapters +</button><div id="toc" class="toc"></div></aside><article><div id="chapterNumber" class="chapter-number"></div><h2 id="chapterHeading" class="chapter-heading"></h2><div id="readerCopy" class="reader-copy protected-reader" tabindex="0"></div><div class="reader-bottom-nav"><button id="prevBottom">← Previous chapter</button><button id="nextBottom">Next chapter →</button></div></article></div></section></main>
<footer class="site-footer"><div><strong>TIDEFALL</strong><p>The official home of the Tidefall fantasy universe.</p></div></footer><div id="copyWarning" class="copy-warning">Book text copying is disabled.</div>
<script src="/site-ui.js" defer></script>
<script>const chapters=${data};(()=>{const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let current=0;const select=$('chapterSelect'),toc=$('toc');chapters.forEach((c,i)=>{const o=document.createElement('option');o.value=i;o.textContent='Chapter '+(i+1)+' — '+c.title;select.appendChild(o);const b=document.createElement('button');b.textContent=String(i+1).padStart(3,'0')+'  '+c.title;b.onclick=()=>show(i,true);toc.appendChild(b)});function show(i,scroll){if(i<0||i>=chapters.length)return;current=i;const c=chapters[i];$('chapterNumber').textContent='Chapter '+(i+1)+' of 120';$('chapterHeading').textContent=c.title;$('readerCopy').innerHTML=c.body.split(/\n\s*\n/).filter(Boolean).map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join('');select.value=i;$('progressCopy').textContent='Chapter '+(i+1)+' of 120 · Your place is saved on this device.';$('prevTop').disabled=$('prevBottom').disabled=i===0;$('nextTop').disabled=$('nextBottom').disabled=i===119;[...toc.children].forEach((b,n)=>b.classList.toggle('active',n===i));localStorage.setItem('tidefall-book-one-chapter',String(i+1));if(location.hash!=='#chapter-'+(i+1))history.replaceState(null,'','#chapter-'+(i+1));if(scroll)$('reader').scrollIntoView({behavior:'smooth'})}select.onchange=()=>show(Number(select.value),true);$('prevTop').onclick=$('prevBottom').onclick=()=>show(current-1,true);$('nextTop').onclick=$('nextBottom').onclick=()=>show(current+1,true);$('tocToggle').onclick=()=>{const open=toc.classList.toggle('open');$('tocToggle').textContent=open?'All chapters −':'All chapters +'};const hash=location.hash.match(/^#chapter-(\d+)$/),stored=Number(localStorage.getItem('tidefall-book-one-chapter')),first=hash?Number(hash[1])-1:(stored>=1&&stored<=120?stored-1:0);show(Math.max(0,Math.min(119,first)),false);const warning=$('copyWarning');let timer;function warn(){warning.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>warning.classList.remove('show'),1600)}document.addEventListener('copy',e=>{if(e.target.closest&&e.target.closest('.protected-reader')){e.preventDefault();warn()}});document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.protected-reader')){e.preventDefault();warn()}})})();</script>
</body></html>`);
  } catch (error) {
    console.error('Book reader server error', error);
    res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Book One reader failed to build: ' + error.message);
  }
};
