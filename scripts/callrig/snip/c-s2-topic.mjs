export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch=(process.env.QA_CH||'C4QCGENERAL0001');
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6000);
  out.header = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const h=document.querySelector('main header')||document.querySelector('header');
    if(!h) return 'no header';
    return {txt:(h.innerText||'').replace(/\s+/g,' ').slice(0,90),
      interactive:[...h.querySelectorAll('*')].filter(vis).filter(e=>e.tagName==='BUTTON'||e.tagName==='A'
        ||e.getAttribute('role')==='button'||getComputedStyle(e).cursor==='pointer')
        .map(e=>({tag:e.tagName, label:e.getAttribute('aria-label')||(e.textContent||'').trim().slice(0,22)}))
        .slice(0,14)};
  });
  // open channel details -> About
  const det=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
  out.detBtn=await det.count();
  if(out.detBtn){ await det.first().click(); await page.waitForTimeout(1600); }
  out.tabs = await page.evaluate(()=>[...document.querySelectorAll('[role="tab"]')]
    .filter(t=>t.getBoundingClientRect().height>0).map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,18)));
  const about=page.locator('[role="tab"]').filter({hasText:'About'});
  if(await about.count()){ await about.first().click(); await page.waitForTimeout(1500); }
  out.aboutPanel = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const panel=[...document.querySelectorAll('[role="tabpanel"]')].find(vis)||document.body;
    return {txt:(panel.innerText||'').replace(/\s+/g,' ').slice(0,220),
      controls:[...panel.querySelectorAll('button,input,textarea,[contenteditable]')].filter(vis)
        .map(e=>({tag:e.tagName, label:e.getAttribute('aria-label')||(e.textContent||'').trim().slice(0,24),
          ph:e.getAttribute('placeholder')}))};
  });
  return out;
};
