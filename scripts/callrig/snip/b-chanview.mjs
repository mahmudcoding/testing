export default async ({page}) => {
  const WS='W4QBF1XTURESO01', CH='C4QBGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.view = await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; };
    const m=document.querySelector('main')||document.body;
    const t=m.innerText.replace(/\s+/g,' ');
    return {
      callBanner: (t.match(/.{0,90}(call|Call).{0,120}/)||[])[0]||null,
      joinButtons: [...m.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(x=>/join|call/i.test(x)).slice(0,10),
      lastMessages: [...document.querySelectorAll('[data-message-id]')].slice(-3).map(e=>e.innerText.replace(/\s+/g,' ').slice(0,120))
    };
  });
  return out;
};
