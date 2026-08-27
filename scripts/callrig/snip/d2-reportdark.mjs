const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const measure = () => page.evaluate(`(() => { const vis=(${VIS});
    const parse=c=>{ const m=(c||'').match(/rgba?\\(([^)]+)\\)/); if(!m) return null;
      const p=m[1].split(',').map(x=>parseFloat(x)); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
    const blend=(f,b)=> f.a>=1?f:{r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1};
    const lum=c=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
      return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b);};
    const effBg=el=>{let n=el; while(n&&n!==document.documentElement){const c=parse(getComputedStyle(n).backgroundColor);
      if(c&&c.a>0.95) return c; n=n.parentElement;}
      const c=parse(getComputedStyle(document.documentElement).backgroundColor);
      return (c&&c.a>0.95)?c:{r:255,g:255,b:255,a:1};};
    const ratio=(a,b)=>{const l1=lum(a),l2=lum(b),hi=Math.max(l1,l2),lo=Math.min(l1,l2);return (hi+0.05)/(lo+0.05);};
    let checked=0; const bad=[];
    for (const el of [...document.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)) {
      const txt=(el.innerText||'').trim(); if(txt.length<2) continue;
      const cs=getComputedStyle(el); let fg=parse(cs.color); if(!fg) continue;
      const bg=effBg(el); fg=blend(fg,bg); checked++;
      const r=ratio(fg,bg); const size=parseFloat(cs.fontSize)||16, w=parseInt(cs.fontWeight)||400;
      const need=(size>=24||(size>=18.66&&w>=700))?3.0:4.5;
      if (r<need) bad.push({t:txt.slice(0,30), ratio:Math.round(r*100)/100, need, size});
    }
    bad.sort((a,b)=>a.ratio-b.ratio);
    return { bodyBg:getComputedStyle(document.body).backgroundColor,
             bodyColor:getComputedStyle(document.body).color,
             checked, failures:bad.length, worst:bad.slice(0,4) }; })()`);
  const out={};
  for (const scheme of ['light','dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('http://127.0.0.1:8731/index.html', { waitUntil:'networkidle' });
    await page.waitForTimeout(1500);
    out[scheme] = await measure();
  }
  await page.emulateMedia({ colorScheme: null });
  return out;
};
