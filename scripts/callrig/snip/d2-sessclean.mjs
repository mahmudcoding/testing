const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const read = async () => page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { deviceRows:(t.match(/Mozilla\\/5\\.0/g)||[]).length,
      buttons:[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>((e.innerText||'').trim()||'(unlabelled)').slice(0,30)) }; })()`);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const before = await read();
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis)
      .filter(x=>/^Sign out other sessions$/.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(2200);
  const confirm = await page.evaluate(`(() => { const vis=(${VIS});
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!d) return {dialog:false};
    const b=[...d.querySelectorAll('button')].filter(vis)
      .map(e=>(e.innerText||'').trim());
    const go=[...d.querySelectorAll('button')].filter(vis)
      .filter(e=>/sign out|confirm|yes/i.test((e.innerText||'').trim()));
    if(go.length) go[go.length-1].click();
    return {dialog:true, buttons:b, clicked:go.length>0}; })()`);
  await page.waitForTimeout(3500);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const after = await read();
  const stillIn = await page.evaluate(async () => {
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    return { status:r.status }; });
  return { before, clicked, confirm, after, currentSessionStillValid:stillIn };
};
