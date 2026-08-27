export default async ({page}) => {
  return await page.evaluate(async () => {
    const snaps=[]; const seen=new Set();
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; };
    const t0=Date.now();
    while (Date.now()-t0 < 30000) {
      const main = document.querySelector('main') || document.body;
      const txt = main.innerText.replace(/\s+/g,' ').trim().slice(0,300);
      const btns = [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim()).filter(Boolean).join('|').slice(0,300);
      const key = txt+'##'+btns+'##'+location.pathname;
      if(!seen.has(key)){ seen.add(key); snaps.push({at:Date.now()-t0, path:location.pathname, txt, btns}); }
      await new Promise(r=>setTimeout(r,300));
    }
    return snaps.slice(0,15);
  });
};
