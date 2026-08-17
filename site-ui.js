(()=>{
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
})();
