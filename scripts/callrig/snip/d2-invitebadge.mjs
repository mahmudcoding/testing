const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/', { waitUntil:'networkidle' });
  await page.waitForTimeout(4000);
  const btnInfo = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>/Pending workspace invites/i.test(x.getAttribute('aria-label')||''));
    if(!b) return '(button not found)';
    const r=b.getBoundingClientRect();
    // every visible descendant with its own text, plus any badge-like element
    const kids=[...b.querySelectorAll('*')].filter(vis).map(e=>({
      tag:e.tagName.toLowerCase(), cls:(e.className||'').toString().slice(0,40),
      text:(e.textContent||'').trim().slice(0,20),
      w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height),
      bg:getComputedStyle(e).backgroundColor, sr:/sr-only/.test((e.className||'').toString()) }));
    return { aria:b.getAttribute('aria-label'), visibleText:(b.innerText||'').trim(),
             box:[Math.round(r.width),Math.round(r.height)], descendants:kids }; })()`);
  // open the menu and see what it offers
  const btn = page.locator('button[aria-label*="Pending workspace invites"]').first();
  let menu=null;
  if (await btn.count()) { await btn.click().catch(()=>{}); await page.waitForTimeout(2500);
    menu = await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis)
        .sort((a,b)=>{const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return (B.width*B.height)-(A.width*A.height);})[0];
      if(!d) return '(no menu)';
      return { text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,320),
        buttons:[...d.querySelectorAll('button,a')].filter(vis).map(x=>(x.innerText||x.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,14) }; })()`); }
  return { workspaceMenuButton: btnInfo, menuContents: menu };
};
