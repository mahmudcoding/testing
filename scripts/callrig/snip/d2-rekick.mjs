const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  const buttons = await page.evaluate(`(() => { const vis = ${VIS};
    return [...document.querySelectorAll('button[aria-label^="Remove "]')].filter(vis)
      .map(b=>({ label:b.getAttribute('aria-label'), disabled: b.disabled===true||b.getAttribute('aria-disabled')==='true' })); })()`);
  const ownerBtn = page.locator('button[aria-label="Remove QA Owner from the company"]').first();
  const present = await ownerBtn.count();
  let dialog=null, result=null, membersAfter=null;
  if (present) {
    const dis = await ownerBtn.isDisabled();
    if (!dis) {
      await ownerBtn.scrollIntoViewIfNeeded(); await ownerBtn.click(); await page.waitForTimeout(2000);
      dialog = await page.evaluate(`(() => { const vis = ${VIS};
        const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vis)[0];
        return d?{ text:(d.innerText||'').replace(/\\n/g,' | ').slice(0,200),
          buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(Boolean)}:'(none)'; })()`);
      // confirm and watch what the user is told
      const net=[]; const on = async r => { if(!r.url().includes('/api/v1/')) return;
        let b=''; try{b=(await r.text()).slice(0,200);}catch{}
        net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,50)} -> ${r.status()} ${b.slice(0,120)}`); };
      page.on('response', on);
      let notices=[];
      const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis = ${VIS};
        return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
          .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
      const conf = page.locator('[role=dialog] button:has-text("Remove member"), [role=alertdialog] button:has-text("Remove member")').first();
      if (await conf.count()) { await conf.click(); await page.waitForTimeout(4000); }
      clearInterval(poll); page.off('response', on);
      result = { requests: net, noticesShownToUser: notices,
                 dialogStillOpen: await page.locator('[role=dialog],[role=alertdialog]').count() > 0 };
      await page.keyboard.press('Escape').catch(()=>{});
    } else { result = 'owner button disabled for this account'; }
    membersAfter = await page.evaluate(async () => {
      const r = await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0', { credentials:'include' });
      const j = await r.json(); const a=j.members||j.items||[]; return { count:a.length, hasOwner: a.some(m=>m.user_id==='U4QDOWNER000001') }; });
  }
  return { removeButtons: buttons, ownerButtonPresent: present, dialog, result, membersAfter };
};
