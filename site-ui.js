(()=>{
  // Never trade real scrolling feel for a synthetic performance score.
  const instantStyle=document.createElement('style');
  instantStyle.textContent='@supports(content-visibility:auto){.section:not(.hero),.reader-section,.lore-section,.explore-section{content-visibility:visible!important;contain-intrinsic-size:auto!important}}';
  document.head.appendChild(instantStyle);

  const headers=document.querySelectorAll('.site-header');
  headers.forEach(header=>{
    const nav=header.querySelector('.nav-links');
    if(!nav)return;
    let toggle=header.querySelector('.nav-toggle');
    if(!toggle){
      toggle=document.createElement('button');
      toggle.type='button';
      toggle.className='nav-toggle';
      toggle.setAttribute('aria-label','Open navigation');
      toggle.setAttribute('aria-expanded','false');
      toggle.textContent='MENU';
      header.insertBefore(toggle,nav);
    }
    const close=()=>{header.classList.remove('nav-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='MENU'};
    toggle.addEventListener('click',()=>{
      const open=!header.classList.contains('nav-open');
      header.classList.toggle('nav-open',open);
      toggle.setAttribute('aria-expanded',String(open));
      toggle.textContent=open?'CLOSE':'MENU';
    });
    nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});
    document.addEventListener('click',e=>{if(!header.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  });

  const path=location.pathname.replace(/\/$/,'')||'/';
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href=(a.getAttribute('href')||'').replace(/\/$/,'')||'/';
    if(href===path)a.setAttribute('aria-current','page');
  });

  // Site-wide book marketing: make it impossible to miss that Tidefall is a book-first fantasy series.
  const noBookPromo=new Set(['/books','/book-one','/reading-order','/book-characters']);
  if(!noBookPromo.has(path)){
    const main=document.querySelector('main');
    if(main&&!document.querySelector('.book-launch-strip')){
      const promoStyle=document.createElement('style');
      promoStyle.textContent='.book-launch-strip{width:min(1180px,calc(100% - 28px));margin:24px auto;padding:18px 20px;border:1px solid rgba(169,213,223,.24);border-radius:20px;background:linear-gradient(135deg,rgba(31,94,114,.24),rgba(255,255,255,.035));display:flex;align-items:center;justify-content:space-between;gap:20px;box-shadow:0 16px 50px rgba(0,0,0,.18)}.book-launch-copy{min-width:0}.book-launch-copy strong{display:block;font-family:Cinzel,Georgia,serif;font-size:clamp(1rem,2vw,1.28rem);margin-bottom:5px}.book-launch-copy span{display:block;color:rgba(255,255,255,.66);line-height:1.55;font-size:.9rem}.book-launch-actions{display:flex;gap:9px;flex-wrap:wrap;flex:0 0 auto}.book-launch-actions a{min-height:40px;padding:0 16px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:700;border:1px solid rgba(255,255,255,.16)}.book-launch-actions a:first-child{background:#f7fbfc;color:#07131f}@media(max-width:720px){.book-launch-strip{align-items:flex-start;flex-direction:column}.book-launch-actions{width:100%}.book-launch-actions a{flex:1}}';
      document.head.appendChild(promoStyle);
      const strip=document.createElement('aside');
      strip.className='book-launch-strip';
      strip.setAttribute('aria-label','Tidefall books');
      strip.innerHTML='<div class="book-launch-copy"><strong>📚 Tidefall is a book-first fantasy series</strong><span>The Academy, characters and games expand the world. The books are the main story. Start with Book One and read Chapter One free.</span></div><div class="book-launch-actions"><a href="/book-one">Start Book One</a><a href="/reading-order">Reading order</a></div>';
      const preferred=main.querySelector(':scope > .hero, :scope > .inner-hero');
      if(preferred)preferred.insertAdjacentElement('afterend',strip);else main.insertBefore(strip,main.firstChild);
    }
  }

  // Give the character hub a direct route into the comparison experience.
  if(path==='/students'){
    const actions=document.querySelector('.character-actions');
    if(actions&&!actions.querySelector('a[href="/core-four"]')){
      const link=document.createElement('a');
      link.className='button secondary';
      link.href='/core-four';
      link.textContent='Compare the Core Four';
      actions.appendChild(link);
    }
  }

  const randomButton=document.querySelector('[data-random-activity]');
  if(randomButton){
    randomButton.addEventListener('click',()=>{
      const cards=[...document.querySelectorAll('.explore-card:not([hidden])')];
      if(!cards.length)return;
      const target=cards[Math.floor(Math.random()*cards.length)];
      if(target?.href)location.href=target.href;
    });
  }

  const search=document.querySelector('[data-explore-search]');
  const chips=[...document.querySelectorAll('[data-explore-filter]')];
  const cards=[...document.querySelectorAll('.explore-card')];
  const empty=document.querySelector('.empty-state');
  if(search&&cards.length){
    let active='all';
    const apply=()=>{
      const q=search.value.trim().toLowerCase();
      let visible=0;
      cards.forEach(card=>{
        const category=card.dataset.category||'';
        const hay=(card.textContent||'').toLowerCase();
        const show=(active==='all'||category===active)&&(!q||hay.includes(q));
        card.hidden=!show;
        if(show)visible++;
      });
      if(empty)empty.classList.toggle('show',visible===0);
    };
    search.addEventListener('input',apply);
    chips.forEach(chip=>chip.addEventListener('click',()=>{
      active=chip.dataset.exploreFilter||'all';
      chips.forEach(c=>c.classList.toggle('is-active',c===chip));
      apply();
    }));
    apply();
  }

  document.querySelectorAll('[data-track-activity]').forEach(link=>{
    link.addEventListener('click',()=>{
      try{
        const recent=JSON.parse(localStorage.getItem('tidefall-recent-activities')||'[]');
        const item={name:link.dataset.activityName||link.textContent.trim(),url:link.getAttribute('href'),time:Date.now()};
        const next=[item,...recent.filter(x=>x.url!==item.url)].slice(0,6);
        localStorage.setItem('tidefall-recent-activities',JSON.stringify(next));
      }catch{}
    });
  });

  // Tiny intent prefetch: only the HTML of a link the user actually points at.
  // This does not prefetch character images or other large assets.
  const prefetched=new Set();
  document.addEventListener('pointerover',e=>{
    const a=e.target.closest?.('a[href^="/"]');
    if(!a)return;
    const href=a.getAttribute('href');
    if(!href||href.startsWith('/#')||prefetched.has(href))return;
    prefetched.add(href);
    const link=document.createElement('link');
    link.rel='prefetch';link.as='document';link.href=href;
    document.head.appendChild(link);
  },{passive:true});
})();
