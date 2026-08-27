export default async ({page}) => {
  const out={};
  // participants panel should be open; click the 2nd "Participant actions" (Bob's row)
  const btns = await page.$$('button[aria-label="Participant actions"]');
  out.count = btns.length;
  if (btns.length < 2) return out;
  await btns[1].click(); await page.waitForTimeout(1600);
  out.menu = await page.evaluate(()=>[...document.querySelectorAll('[role="menuitem"],[role="menuitemradio"],button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(l=>/remove|ban|co-host|hold|permission|mute|spotlight|message/i.test(l)).slice(0,15));
  const rm = page.locator('[role="menuitem"]', {hasText:/Remove from call/i}).first();
  out.hasRemove = await rm.count();
  if (out.hasRemove) { await rm.click(); await page.waitForTimeout(1600); }
  out.dialog = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? {txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,400), btns:[...d.querySelectorAll('button')].map(b=>(b.textContent||'').trim())} : null;
  });
  await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].pop(); if(d){const c=[...d.querySelectorAll('button')].find(b=>/cancel/i.test(b.textContent||'')); if(c)c.click();}});
  await page.waitForTimeout(700);
  return out;
};
