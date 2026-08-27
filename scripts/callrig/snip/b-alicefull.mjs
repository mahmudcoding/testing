export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWAZJ5MTHSO98';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const visible = `el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
    let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; }`;
  out.beforePanel = await page.evaluate((vs)=>{ const vis=eval(vs);
    return {
      buttons: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,40),
      hasAdmitWord: /admit|approve|waiting room|wants to join|is waiting/i.test(document.body.innerText)
    }; }, visible);
  // open participants panel
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Participants'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  out.afterPanel = await page.evaluate((vs)=>{ const vis=eval(vs);
    const panelTxt = document.body.innerText.replace(/\s+/g,' ');
    return {
      buttons: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,50),
      hasAdmitWord: /admit|approve|waiting room|wants to join|is waiting/i.test(panelTxt),
      around: (panelTxt.match(/.{0,100}(admit|approve|waiting).{0,100}/i)||[])[0]||null,
      tabs: [...document.querySelectorAll('[role=tab]')].filter(vis).map(t=>t.innerText.replace(/\s+/g,' ').trim())
    }; }, visible);
  out.api = await page.evaluate(async(M)=>{
    const g = async u => { const r=await fetch(u,{credentials:'include'}); const t=await r.text(); return {s:r.status, b:t.slice(0,400)}; };
    return { cur: await g('/api/v1/meetings/current'), wr: await g(`/api/v1/meeting/${M}/waiting-room`) };
  }, M);
  return out;
};
