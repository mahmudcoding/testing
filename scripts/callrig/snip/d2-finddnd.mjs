const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const pages = [['notifications',`/w/${W}/settings/notifications`], ['profile',`/w/${W}/settings/profile`],
                 ['account',`/w/${W}/settings/account`], ['privacy',`/w/${W}/settings/privacy`]];
  const out={};
  for (const [n,p] of pages) {
    await page.goto('https://airion-cargo.store'+p, { waitUntil:'networkidle' });
    await page.waitForTimeout(2500);
    out[n] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'');
      const sw=[...main.querySelectorAll('[role=switch]')].filter(vis).map(e=>{ let x=e.parentElement,box=null;
        for(let k=0;k<6&&x;k++){ if(x.querySelectorAll('[role=switch]').length===1) box=x; else break; x=x.parentElement; }
        return ((box?box.innerText:'')||'').split('\\n')[0].slice(0,40); });
      return { switches: sw, mentionsDND: /do not disturb|dnd|не беспокоить/i.test(t),
               dndContext: (t.match(/.{0,40}[Dd]o not disturb.{0,40}/g)||[]).slice(0,2) }; })()`);
  }
  // also check the profile/avatar menu, where DND often lives
  await page.goto(`https://airion-cargo.store/w/${W}/directories`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  const prof = page.locator('button[aria-label*="Profile" i]').first();
  if (await prof.count()) { await prof.click(); await page.waitForTimeout(2000);
    out.profileMenu = await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis)[0];
      if(!d) return '(no menu)';
      return { text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,260),
               mentionsDND:/do not disturb|dnd/i.test(d.innerText||'') }; })()`); }
  return out;
};
