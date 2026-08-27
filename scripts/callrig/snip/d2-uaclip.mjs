const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const width of [1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2300);
    out[width] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const ua=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
        .filter(e=>/Mozilla\\/5\\.0/.test(e.innerText||''))[0];
      if(!ua) return {found:false};
      const cs=getComputedStyle(ua);
      const full=(ua.innerText||'').trim();
      // how much fits: binary-search the widest prefix that fits clientWidth
      const meas=document.createElement('span');
      meas.style.cssText='position:absolute;visibility:hidden;white-space:pre;font:'+cs.font;
      document.body.appendChild(meas);
      let lo=0, hi=full.length;
      while(lo<hi){ const mid=Math.ceil((lo+hi)/2); meas.textContent=full.slice(0,mid);
        if(meas.getBoundingClientRect().width<=ua.clientWidth) lo=mid; else hi=mid-1; }
      meas.remove();
      return { found:true, sw:ua.scrollWidth, cw:ua.clientWidth,
        overflowX:cs.overflowX, textOverflow:cs.textOverflow, whiteSpace:cs.whiteSpace,
        fullLen:full.length, visibleChars:lo,
        visiblePart:full.slice(0,lo), cutPart:full.slice(lo).slice(0,60),
        rowText:(()=>{ let n=ua; for(let i=0;i<4&&n;i++){ n=n.parentElement; if(!n)break;
          const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t.length>40&&t.length<300) return t.slice(0,180); } return ''; })() }; })()`);
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  return out;
};
