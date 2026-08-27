export default async ({page}) => {
  const out={};
  const open = async () => {
    const btns = await page.$$('button[aria-label="Participant actions"]');
    out.n = btns.length;
    if (btns.length>=2){ await btns[1].click(); await page.waitForTimeout(1800); return true; }
    return false;
  };
  if (!(await open())) {
    await page.locator('button[aria-label="Participants"]').first().click();
    await page.waitForTimeout(2000);
    await open();
  }
  out.visibleBtns = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).map(e=>(e.textContent||'').replace(/\s+/g,' ').trim()).filter(t=>/remove|ban/i.test(t)));
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).find(e=>/Remove from call/i.test((e.textContent||'').trim()));
    if(!b) return false; b.click(); return true;
  });
  await page.waitForTimeout(2000);
  out.dialogs = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).map(d=>({
    txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,350), btns:[...d.querySelectorAll('button')].map(b=>(b.textContent||'').replace(/\s+/g,' ').trim()).slice(0,8)})));
  return out;
};
