const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const idle = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,26)).filter(Boolean); })()`);
  // make it dirty so the save control appears
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const sw=[...main.querySelectorAll('[role=switch]')].filter(vis)[0];
    if(sw) sw.click(); })()`);
  await page.waitForTimeout(1500);
  const dirty = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,26)).filter(Boolean); })()`);
  // revert the toggle without saving
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Discard/i.test((x.innerText||'').trim()))[0];
    if(b) b.click(); })()`);
  await page.waitForTimeout(1200);
  const settings = await page.evaluate(`(async()=>await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text())()`);
  return { buttonsIdle:idle, buttonsWhenDirty:dirty, settingsAfter:settings };
};
