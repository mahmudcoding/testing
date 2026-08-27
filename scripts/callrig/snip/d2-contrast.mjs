const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const PATH = process.env.D2_PATH || 'account';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/${PATH}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const parse=c=>{ const m=(c||'').match(/rgba?\\(([^)]+)\\)/); if(!m) return null;
      const p=m[1].split(',').map(x=>parseFloat(x)); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
    const lum=c=>{ const f=v=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
      return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); };
    const effBg=el=>{ let n=el;
      while(n && n!==document.documentElement){ const c=parse(getComputedStyle(n).backgroundColor);
        if(c && c.a>0.95) return c; n=n.parentElement; }
      return {r:255,g:255,b:255,a:1}; };
    const ratio=(a,b)=>{ const l1=lum(a),l2=lum(b); const hi=Math.max(l1,l2),lo=Math.min(l1,l2);
      return (hi+0.05)/(lo+0.05); };
    const main=document.querySelector('main')||document.body;
    const out=[];
    for (const el of [...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)) {
      const txt=(el.innerText||'').trim(); if(txt.length<2) continue;
      const cs=getComputedStyle(el); const fg=parse(cs.color); if(!fg) continue;
      const bg=effBg(el); const r=ratio(fg,bg);
      const size=parseFloat(cs.fontSize)||16; const weight=parseInt(cs.fontWeight)||400;
      const large = size>=24 || (size>=18.66 && weight>=700);
      const need = large?3.0:4.5;
      if (r < need) out.push({ t:txt.slice(0,40), ratio:Math.round(r*100)/100, need, size, weight,
                               fg:cs.color, bg:'rgb('+bg.r+','+bg.g+','+bg.b+')' });
    }
    return { path:location.pathname.split('/settings/')[1], checked:[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis).length,
             failures:out.slice(0,8), failCount:out.length }; })()`);
};
