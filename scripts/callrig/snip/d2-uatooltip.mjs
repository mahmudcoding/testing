const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2400);
  const info = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const ua=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .filter(e=>/Mozilla\\/5\\.0/.test(e.innerText||''))[0];
    if(!ua) return {found:false};
    const anc=[]; let n=ua;
    for(let i=0;i<4&&n;i++){ anc.push({tag:n.tagName.toLowerCase(), title:n.getAttribute('title')||'',
      aria:n.getAttribute('aria-label')||'', cls:(n.className||'').toString().slice(0,40)}); n=n.parentElement; }
    const r=ua.getBoundingClientRect();
    return { found:true, ownTitle:ua.getAttribute('title')||'', ancestors:anc,
             center:[Math.round(r.left+r.width/2), Math.round(r.top+r.height/2)] }; })()`);
  if (!info.found) return info;
  // hover and look for a tooltip
  await page.mouse.move(info.center[0], info.center[1]);
  await page.waitForTimeout(2000);
  const tip = await page.evaluate(`(() => { const vis=(${VIS});
    const t=[...document.querySelectorAll('[role=tooltip],[data-radix-popper-content-wrapper],[class*=ooltip]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,160));
    return { tooltips:t, bodyHasIP:/86\\.62\\.0\\.71/.test(document.body.innerText||'') }; })()`);
  // is the IP anywhere reachable at all?
  const api = await page.evaluate(async () => {
    for (const u of ['/api/v1/users/me/sessions','/api/v1/auth/sessions','/api/v1/sessions']) {
      const r=await fetch(u,{credentials:'include'});
      if (r.status===200) return { endpoint:u, body:(await r.text()).slice(0,260) };
    }
    return { endpoint:'(none of the guesses returned 200)' };
  });
  return { info:{ownTitle:info.ownTitle, ancestors:info.ancestors}, tip, api };
};
