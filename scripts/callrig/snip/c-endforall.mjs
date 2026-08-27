export default async ({page}) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  const out={};
  out.clicked = await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="End for everyone"]')].find(x=>x.getClientRects().length); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(1800);
  out.confirm = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? (d.innerText||'').replace(/\n+/g,' | ').slice(0,180):null;});
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-end-confirm-submit"]'); if(b)b.click();});
  await page.waitForTimeout(4000);
  out.hostScreen = await page.evaluate(()=>({url:location.pathname, txt:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,220)}));
  return out;
};
