export default async ({page}) => {
  const out={};
  out.old = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
    const i=[...d.querySelectorAll('input')].find(x=>/join/i.test(String(x.value))); return i?String(i.value):null;});
  out.clicked = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/create new link/i.test((x.textContent||'').trim())); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(3500);
  out.neu = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
    const i=[...d.querySelectorAll('input')].find(x=>/join/i.test(String(x.value))); return i?String(i.value):null;});
  return out;
};
