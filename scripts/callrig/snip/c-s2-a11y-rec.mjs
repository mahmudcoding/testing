const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    if (window.__a11y) clearInterval(window.__a11y.id);
    const rec={samples:[], t0:performance.now()};
    const id=setInterval(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
        let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
      const live=[...document.querySelectorAll('[role="status"],[role="alert"],[aria-live]')]
        .map(e=>({t:(e.textContent||'').trim().slice(0,90), vis:vis(e), sr:/sr-only/.test(e.className||'')}))
        .filter(x=>x.t);
      const last=[...document.querySelectorAll('[data-message-id]')].pop();
      const s={t:Math.round(performance.now()-rec.t0), live, lastMsg: last? last.innerText.replace(/\n+/g,' | ').slice(0,80):null};
      const prev=rec.samples[rec.samples.length-1];
      if (!prev || JSON.stringify(prev.live)!==JSON.stringify(s.live) || prev.lastMsg!==s.lastMsg) rec.samples.push(s);
      if (rec.samples.length>120) clearInterval(id);
    },300);
    rec.id=id; window.__a11y=rec;
    return {started:true, vis:document.visibilityState};
  });
};
