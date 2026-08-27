export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`);
  await page.waitForTimeout(5000);
  const info=await page.evaluate((name)=>{
    let best=null;
    for (const el of document.querySelectorAll('main *')){
      const t=el.innerText||''; if(!t.includes(name)) continue;
      const btn=[...el.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||b.textContent.trim())==='Message');
      if(!btn) continue;
      const a=el.getBoundingClientRect().width*el.getBoundingClientRect().height;
      if(!best||a<best.a) best={el,a};
    }
    if(!best) return null;
    const names=[...new Set((best.el.innerText||'').match(/QA [A-Z][a-z]+/g)||[])];
    if(names.length!==1) return {abort:names};
    [...best.el.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent.trim())==='Message')
      .setAttribute('data-qa-msgbtn','1');
    return {names};
  }, 'QA Guest');
  if(!info||info.abort) return {info};
  // poll visible text from BEFORE the click
  await page.evaluate(()=>{
    window.__fl={s:[],t0:performance.now()};
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
      let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;}
      return op>=0.05;};
    window.__flId=setInterval(()=>{
      const hits=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0)
        .filter(e=>/Pinned message|Add teammates|Start this channel|Add users|View all/.test(e.textContent||''))
        .filter(vis).map(e=>e.textContent.trim().slice(0,40));
      window.__fl.s.push({t:Math.round(performance.now()-window.__fl.t0), hits, path:location.pathname.slice(-16)});
    },150);
  });
  await page.waitForTimeout(600);
  await page.locator('[data-qa-msgbtn="1"]').click();
  await page.waitForTimeout(9000);
  const s=await page.evaluate(()=>{ clearInterval(window.__flId); return window.__fl.s; });
  return {info, samples:s.length, withHits:s.filter(x=>x.hits.length), url:page.url()};
};
