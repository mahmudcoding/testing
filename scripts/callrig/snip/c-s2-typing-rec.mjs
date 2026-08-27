const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  return await page.evaluate(() => {
    if (window.__typRec) { clearInterval(window.__typRec.id); }
    const t0 = performance.now();
    const rec = {samples: [], t0};
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const id = setInterval(() => {
      const hits = [...document.querySelectorAll('div,span,p')]
        .filter(e => e.children.length===0 && /typing/i.test(e.textContent||''))
        .map(e => ({text:(e.textContent||'').trim().slice(0,60), vis:vis(e)}));
      rec.samples.push({t: Math.round(performance.now()-t0), hits, n: document.querySelectorAll('[data-message-id]').length});
      if (rec.samples.length > 240) clearInterval(id);
    }, 300);
    rec.id = id;
    window.__typRec = rec;
    return {started:true, visibility: document.visibilityState, url: location.href};
  });
};
