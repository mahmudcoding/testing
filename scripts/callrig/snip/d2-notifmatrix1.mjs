const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const api = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});
    return { status:r.status, body: await r.text() };})()`);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const switches=[...main.querySelectorAll('[role=switch],input[type=checkbox]')].filter(vis).map(sw=>{
      // label: nearest ancestor block that carries text
      let n=sw, lab='';
      for(let i=0;i<6 && n;i++){ n=n.parentElement; if(!n) break;
        const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t && t.length<120){ lab=t; break; } }
      return { checked: sw.getAttribute('aria-checked')||String(sw.checked),
               disabled: sw.disabled===true||sw.getAttribute('aria-disabled')==='true',
               label: lab.slice(0,70) }; });
    return { switchCount:switches.length, switches }; })()`);
  return { api, ui };
};
