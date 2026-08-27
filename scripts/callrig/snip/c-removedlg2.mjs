export default async ({page}) => {
  const out={};
  const btns = await page.$$('button[aria-label="Participant actions"]');
  if (btns.length>=2){ await btns[1].click(); await page.waitForTimeout(1600); }
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).find(e=>/^Remove from call$/i.test((e.textContent||'').trim()));
    if(!b) return false; b.click(); return true;
  });
  await page.waitForTimeout(1800);
  out.dialog = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length);
    return ds.map(d=>({txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,350), btns:[...d.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).slice(0,6)}));
  });
  await page.evaluate(()=>{const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1]; if(d){const c=[...d.querySelectorAll('button')].find(b=>/^cancel$/i.test((b.textContent||'').trim())); if(c)c.click();}});
  await page.waitForTimeout(700);
  await page.keyboard.press('Escape');
  return out;
};
