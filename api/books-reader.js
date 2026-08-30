import fs from 'node:fs';
import path from 'node:path';

const DIR=path.join(process.cwd(),'api','book1-chapters');
const MANIFEST=JSON.parse(fs.readFileSync(path.join(DIR,'manifest.json'),'utf8'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras=s=>s.split(/\n\s*\n/).filter(Boolean).map(p=>'<p>'+esc(p.replace(/\s*\n\s*/g,' '))+'</p>').join('');
export default function handler(req,res){
 const raw=Array.isArray(req.query?.chapter)?req.query.chapter[0]:req.query?.chapter;
 const n=Math.min(120,Math.max(1,parseInt(raw||'1',10)||1));
 const meta=MANIFEST[n-1];
 const body=fs.readFileSync(path.join(DIR,meta.file),'utf8');
 const options=MANIFEST.map(x=>'<option value="'+x.number+'" '+(x.number===n?'selected':'')+'>Chapter '+x.number+' — '+esc(x.title)+'</option>').join('');
 const prev=n>1?'<a href="/books?chapter='+(n-1)+'#reader">← Previous chapter</a>':'<span></span>';
 const next=n<120?'<a href="/books?chapter='+(n+1)+'#reader">Next chapter →</a>':'<span></span>';
 const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tidefall: The Listening Tide | Chapter '+n+'</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/reader-isolation.css"></head><body><header class="site-header"><a class="brand" href="/">TIDEFALL</a><nav class="nav-links"><a href="/">Home</a><a href="/start-here">Start Here</a><a href="/explore">Explore</a><a href="/academy">Academy</a><a href="/characters">Characters</a><a href="/books" aria-current="page">Books</a><a href="/lore">Lore</a><a href="/spells">Spells</a></nav></header><main id="reader" class="reader-shell"><aside class="reader-sidebar"><p class="reader-kicker">THE LISTENING TIDE</p><h1>BOOK ONE</h1><label for="chapter-select">JUMP TO CHAPTER</label><select id="chapter-select" onchange="location.href=\'/books?chapter=\'+this.value+\'#reader\'">'+options+'</select><div class="reader-nav">'+prev+next+'</div></aside><article class="reader-article"><p class="reader-count">CHAPTER '+n+' OF 120</p><h2>'+esc(meta.title)+'</h2><div class="reader-copy">'+paras(body)+'</div><div class="reader-bottom-nav">'+prev+next+'</div></article></main><script src="/site-ui.js" defer></script></body></html>';
res.setHeader('Content-Type','text/html; charset=utf-8'); res.setHeader('Cache-Control','public, max-age=0, s-maxage=300'); res.status(200).send(html);
}
