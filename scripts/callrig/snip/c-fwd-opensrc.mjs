export default async ({page}) => {
  const before = page.url();
  const errs=[]; page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,120)); });
  const msg = page.locator('[data-message-id="M4OWAUZE7PA2YX1"]');
  await msg.scrollIntoViewIfNeeded();
  await msg.hover(); await page.waitForTimeout(600);
  const btn = msg.locator('button[aria-label="Open source message"]').first();
  await btn.click();
  // poll for 6s: url, dialogs, toasts, visible message count
  const snaps=[];
  for(let i=0;i<20;i++){
    await page.waitForTimeout(300);
    const s = await page.evaluate(() => {
      const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
        let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
      const toasts=[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],.toast')].filter(vis).map(t=>t.innerText.trim().slice(0,120)).filter(Boolean);
      const dlgs=[...document.querySelectorAll('[role=dialog]')].filter(vis).map(d=>d.innerText.trim().slice(0,150));
      return {u:location.pathname+location.search, toasts, dlgs, msgs:document.querySelectorAll('[data-message-id]').length};
    });
    snaps.push(s);
  }
  const uniq = [];
  for(const s of snaps){ const k=JSON.stringify(s); if(!uniq.length||JSON.stringify(uniq[uniq.length-1])!==k) uniq.push(s); }
  return {before, changes: uniq, consoleErrors: errs.slice(0,5)};
};
