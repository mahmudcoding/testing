/* Lane D instrument (not a repro): measures the contrast of the settings navigation group
 * headings against their actual background in both themes, blending translucent colour over
 * the first opaque ancestor background. Used to re-check the A11Y finding
 * "Второстепенный текст в настройках не дотягивает до контраста AA" on v0.61.0-rc.6.
 * Result on that build: 4.89:1 light, 5.71:1 dark — the finding no longer reproduces. */
const WS = 'W4QDF1XTURESO01';
const RATIO = () => {
  const parse=(c)=>{const m=String(c).match(/rgba?\(([^)]+)\)/); const p=m[1].split(',').map(s=>parseFloat(s.trim()));
    return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};};
  const bgOf=(el)=>{let n=el; while(n&&n!==document.documentElement){const c=parse(getComputedStyle(n).backgroundColor);
    if(c&&c.a>0.99) return c; n=n.parentElement;} const h=parse(getComputedStyle(document.documentElement).backgroundColor);
    return (h&&h.a>0.99)?h:{r:255,g:255,b:255,a:1};};
  const over=(f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a)});
  const lum=(c)=>{const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
    return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b);};
  const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05);};
  const pick=(txt)=>{ for(const el of document.querySelectorAll('*')){ if(el.children.length) continue;
    if((el.innerText||'').trim()!==txt) continue; const cs=getComputedStyle(el); const bg=bgOf(el);
    return { text:txt, color:cs.color, bg:`rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
             px:Math.round(parseFloat(cs.fontSize)*100)/100, ratio:Math.round(ratio(over(parse(cs.color),bg),bg)*100)/100 }; }
    return null; };
  const uname = (()=>{ for(const el of document.querySelectorAll('*')){ if(el.children.length) continue;
    const t=(el.innerText||'').trim(); if(!/^@qa_d_/.test(t)) continue; const cs=getComputedStyle(el); const bg=bgOf(el);
    return { text:t, color:cs.color, px:Math.round(parseFloat(cs.fontSize)*100)/100,
             ratio:Math.round(ratio(over(parse(cs.color),bg),bg)*100)/100 }; } return null; })();
  return { theme: document.documentElement.getAttribute('data-theme'),
           token: getComputedStyle(document.documentElement).getPropertyValue('--color-text3').trim(),
           SETTINGS: pick('SETTINGS'), ADMIN: pick('ADMIN'), username: uname };
};
const setTheme = async (page, which) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(2600);
  await page.evaluate((w)=>{ const b=[...document.querySelectorAll('main button')].find(x=>x.innerText.trim()===w); b&&b.click(); }, which);
  await page.waitForTimeout(1600);
};
export default async ({ page }) => {
  const out = {};
  for (const th of ['Light','Dark']) {
    await setTheme(page, th);
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/members`, { waitUntil:'domcontentloaded' });
    await page.waitForTimeout(3200);
    out[th] = await page.evaluate(RATIO);
  }
  await setTheme(page, 'Light');
  return out;
};
