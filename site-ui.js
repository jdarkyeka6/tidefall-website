(()=>{
  // Never trade real scrolling feel for a synthetic performance score.
  const instantStyle=document.createElement('style');
  instantStyle.textContent='@supports(content-visibility:auto){.section:not(.hero),.reader-section,.lore-section,.explore-section{content-visibility:visible!important;contain-intrinsic-size:auto!important}}';
  document.head.appendChild(instantStyle);

  const path=location.pathname.replace(/\/$/,'')||'/';

  const headers=document.querySelectorAll('.site-header');
  headers.forEach(header=>{
    const nav=header.querySelector('.nav-links');
    if(!nav)return;

    // Make the new-reader funnel a permanent first-class route across the site.
    if(!nav.querySelector('a[href="/start-here"]')){
      const start=document.createElement('a');
      start.href='/start-here';
      start.textContent='Start Here';
      const home=[...nav.querySelectorAll('a')].find(a=>(a.getAttribute('href')||'')==='/');
      if(home)home.insertAdjacentElement('afterend',start);else nav.insertBefore(start,nav.firstChild);
    }

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

  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href=(a.getAttribute('href')||'').replace(/\/$/,'')||'/';
    if(href===path)a.setAttribute('aria-current','page');
  });

  // Homepage: turn the first screen after the hero into a real book launch, not a generic site directory.
  if(path==='/'){
    const main=document.querySelector('main');
    const hero=main?.querySelector(':scope > .hero');
    const homeStyle=document.createElement('style');
    homeStyle.textContent=`
      .home-book-launch{width:min(1220px,calc(100% - 30px));margin:30px auto 82px;border:1px solid rgba(169,213,223,.2);border-radius:32px;overflow:hidden;background:radial-gradient(circle at 82% 8%,rgba(93,186,211,.14),transparent 28%),linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.015));display:grid;grid-template-columns:minmax(210px,300px) 1fr;gap:clamp(28px,5vw,70px);align-items:center;padding:clamp(26px,5vw,58px)}
      .home-book-cover{aspect-ratio:2/3;border-radius:6px 18px 18px 6px;border:1px solid rgba(255,255,255,.18);background:radial-gradient(circle at 50% 18%,rgba(134,219,237,.22),transparent 26%),linear-gradient(160deg,#173d52,#07131f 60%,#03090d);box-shadow:-10px 22px 60px rgba(0,0,0,.38),inset 13px 0 16px rgba(255,255,255,.025);display:flex;flex-direction:column;justify-content:space-between;text-align:center;padding:12% 11%;font-family:Cinzel,Georgia,serif;letter-spacing:.08em;position:relative;overflow:hidden}
      .home-book-cover:before{content:"";position:absolute;left:15px;top:0;bottom:0;width:1px;background:rgba(255,255,255,.13)}
      .home-book-cover small{font-size:.62rem;letter-spacing:.22em;color:rgba(255,255,255,.68)}.home-book-cover strong{font-size:clamp(1.8rem,4vw,3rem);line-height:.92}.home-book-cover span{font-size:.72rem;letter-spacing:.2em;color:#b9e1e9}
      .home-book-copy .eyebrow{margin:0 0 10px}.home-book-copy h2{font-family:Cinzel,Georgia,serif;font-size:clamp(2.7rem,6vw,5.4rem);line-height:.98;margin:0 0 18px}.home-book-copy>p{max-width:700px;color:rgba(255,255,255,.7);line-height:1.8;font-size:1.02rem}.home-book-hook{margin:24px 0 0;padding:18px 20px;border-left:2px solid rgba(169,213,223,.7);background:rgba(255,255,255,.025);font-family:Cinzel,Georgia,serif;font-size:clamp(1.2rem,2.5vw,1.75rem);line-height:1.4}.home-book-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}.home-book-actions a{min-height:48px;padding:0 20px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;border:1px solid rgba(255,255,255,.18)}.home-book-actions a:first-child{background:#f7fbfc;color:#07131f}
      .home-book-proof{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.home-book-proof span{padding:7px 10px;border:1px solid rgba(255,255,255,.1);border-radius:999px;color:rgba(255,255,255,.58);font-size:.75rem}
      .home-books-upgraded{width:min(1180px,100%);margin:auto}.home-books-upgraded .book-world-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:16px;margin-top:28px}.home-books-upgraded .book-story-card,.home-books-upgraded .book-side-card{border:1px solid rgba(255,255,255,.11);border-radius:26px;background:rgba(255,255,255,.025);padding:clamp(25px,4vw,42px)}.home-books-upgraded .book-story-card{min-height:330px;display:flex;flex-direction:column;justify-content:flex-end;background:radial-gradient(circle at 80% 0%,rgba(88,176,201,.13),transparent 34%),rgba(255,255,255,.025)}.home-books-upgraded .book-story-card strong{font-family:Cinzel,Georgia,serif;font-size:clamp(2rem,4vw,3.5rem);line-height:1.05}.home-books-upgraded .book-story-card p,.home-books-upgraded .book-side-card p{color:rgba(255,255,255,.62);line-height:1.7}.home-books-upgraded .book-side-stack{display:grid;gap:16px}.home-books-upgraded .book-side-card strong{display:block;font-size:1.08rem;margin-bottom:8px}
      @media(max-width:820px){.home-book-launch{grid-template-columns:1fr}.home-book-cover{width:min(270px,70vw);margin:auto}.home-book-copy{text-align:center}.home-book-actions,.home-book-proof{justify-content:center}.home-books-upgraded .book-world-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(homeStyle);

    if(hero&&!document.querySelector('.home-book-launch')){
      const launch=document.createElement('section');
      launch.className='home-book-launch';
      launch.setAttribute('aria-label','Start the Tidefall book series');
      launch.innerHTML=`
        <div class="home-book-cover"><small>THE TIDE IS MOVING</small><strong>TIDEFALL<br>ACADEMY</strong><span>BOOK ONE</span></div>
        <div class="home-book-copy">
          <p class="eyebrow">THE WEBSITE IS THE WORLD. THE BOOKS ARE THE STORY.</p>
          <h2>Start with Book One.</h2>
          <p>Tidefall Academy is a book-first fantasy series. The quizzes, maps, spells and lore let you wander around the world, but the actual story begins with Jasper Holloway and the first book.</p>
          <div class="home-book-hook">“Jasper Holloway was underwater, but he could breathe.”</div>
          <div class="home-book-actions"><a href="/books">Read Book 1</a><a href="/book-one">See Book One</a><a href="/start-here">I'm new to Tidefall</a></div>
          <div class="home-book-proof"><span>Book One is the beginning</span><span>Full Book One online</span><span>Four central characters</span><span>Fantasy · magic academy</span></div>
        </div>`;
      hero.insertAdjacentElement('afterend',launch);
    }

    const books=document.querySelector('#books');
    if(books){
      books.classList.add('home-books-upgraded');
      books.innerHTML=`
        <div class="section-heading"><p class="eyebrow section-kicker">THE MAIN STORY</p><h2>Read Tidefall, then explore it.</h2><p class="section-lead">Book One is not an extra feature hidden inside the website. It is the beginning of the story. Everything else on tidefall.com.au is a door back into that world.</p></div>
        <div class="book-world-grid">
          <a class="book-story-card" href="/book-one"><span class="eyebrow">BOOK ONE</span><strong>The story starts beneath the water.</strong><p>Meet Jasper Holloway, enter Tidefall Academy, and begin the mystery before you read the lore about it.</p><span class="gateway-arrow">Enter Book One →</span></a>
          <div class="book-side-stack">
            <a class="book-side-card" href="/books"><strong>📖 Read Book 1</strong><p>Open <em>The Water Without a Sky</em>, the complete 120-chapter Tidefall Book One.</p><span class="gateway-arrow">Start reading →</span></a>
            <a class="book-side-card" href="/start-here"><strong>🧭 New-reader path</strong><p>Book first, characters second, Academy third. Use the official five-step route into Tidefall.</p><span class="gateway-arrow">Show me where to start →</span></a>
            <a class="book-side-card" href="/reading-order"><strong>▤ Reading order</strong><p>See exactly where Book One sits and how the series begins without invented filler or spoilers.</p><span class="gateway-arrow">Open reading order →</span></a>
          </div>
        </div>`;
    }
  }

  // Site-wide book marketing for pages outside the launch funnel.
  const noBookPromo=new Set(['/','/books','/book-one','/reading-order','/book-characters','/start-here']);
  if(!noBookPromo.has(path)){
    const main=document.querySelector('main');
    if(main&&!document.querySelector('.book-launch-strip')){
      const promoStyle=document.createElement('style');
      promoStyle.textContent='.book-launch-strip{width:min(1180px,calc(100% - 28px));margin:24px auto;padding:18px 20px;border:1px solid rgba(169,213,223,.24);border-radius:20px;background:linear-gradient(135deg,rgba(31,94,114,.24),rgba(255,255,255,.035));display:flex;align-items:center;justify-content:space-between;gap:20px;box-shadow:0 16px 50px rgba(0,0,0,.18)}.book-launch-copy{min-width:0}.book-launch-copy strong{display:block;font-family:Cinzel,Georgia,serif;font-size:clamp(1rem,2vw,1.28rem);margin-bottom:5px}.book-launch-copy span{display:block;color:rgba(255,255,255,.66);line-height:1.55;font-size:.9rem}.book-launch-actions{display:flex;gap:9px;flex-wrap:wrap;flex:0 0 auto}.book-launch-actions a{min-height:40px;padding:0 16px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:700;border:1px solid rgba(255,255,255,.16)}.book-launch-actions a:first-child{background:#f7fbfc;color:#07131f}@media(max-width:720px){.book-launch-strip{align-items:flex-start;flex-direction:column}.book-launch-actions{width:100%}.book-launch-actions a{flex:1}}';
      document.head.appendChild(promoStyle);
      const strip=document.createElement('aside');
      strip.className='book-launch-strip';
      strip.setAttribute('aria-label','Tidefall books');
      strip.innerHTML='<div class="book-launch-copy"><strong>📚 The books are the main Tidefall story</strong><span>You are exploring the world around the series. Start with Book One and read Book 1.</span></div><div class="book-launch-actions"><a href="/books">Read Book 1</a><a href="/start-here">Start here</a></div>';
      const preferred=main.querySelector(':scope > .hero, :scope > .inner-hero');
      if(preferred)preferred.insertAdjacentElement('afterend',strip);else main.insertBefore(strip,main.firstChild);
    }
  }

  // Reading progress for the actual complete Book One reader.
  if(path==='/books'){
    const bar=document.createElement('div');
    bar.setAttribute('aria-hidden','true');
    bar.style.cssText='position:fixed;top:0;left:0;height:3px;width:0;background:currentColor;z-index:9999;box-shadow:0 0 14px rgba(169,213,223,.7);transition:width .08s linear';
    document.body.appendChild(bar);
    const update=()=>{
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      bar.style.width=`${Math.min(100,Math.max(0,scrollY/max*100))}%`;
    };
    addEventListener('scroll',update,{passive:true});
    update();
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
