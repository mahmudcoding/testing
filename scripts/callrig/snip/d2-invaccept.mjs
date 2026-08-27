const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/', { waitUntil:'networkidle' });
  await page.waitForTimeout(4000);
  const btn = page.locator('button[aria-label*="Pending workspace invites"]').first();
  if (!(await btn.count())) return { err:'workspace menu button not found' };
  await btn.click(); await page.waitForTimeout(2800);
  const region = await page.evaluate(`(() => { const vis=(${VIS});
    // find the smallest visible container holding the PENDING INVITES heading and the invite text
    const all=[...document.querySelectorAll('body *')].filter(vis)
      .filter(e=>/PENDING INVITES/i.test(e.innerText||'') && /QA Workspace D/.test(e.innerText||''));
    const box=all.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!box) return '(region not found)';
    // EVERY interactive-capable node inside, not just buttons
    const inter=[...box.querySelectorAll('*')].filter(vis).filter(e=>{
      const t=e.tagName.toLowerCase(); const r=e.getAttribute('role')||'';
      return t==='button'||t==='a'||t==='input'||t==='select'||t==='textarea'
        || ['button','link','menuitem','checkbox','switch','option','tab'].includes(r)
        || e.hasAttribute('onclick') || e.tabIndex >= 0 || getComputedStyle(e).cursor==='pointer'; })
      .map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                 text:(e.innerText||'').trim().replace(/\\n/g,' | ').slice(0,44),
                 aria:(e.getAttribute('aria-label')||'').slice(0,40), cursor:getComputedStyle(e).cursor }));
    return { regionText:(box.innerText||'').replace(/\\n+/g,' | ').slice(0,340),
             interactiveCount:inter.length, interactive:inter.slice(0,14) }; })()`);
  return { pendingInviteRegion: region };
};
