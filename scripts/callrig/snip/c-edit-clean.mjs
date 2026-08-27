export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const cancel = page.locator('button[aria-label="Cancel editing"]').first();
  if(await cancel.count()){ await cancel.click(); await page.waitForTimeout(1200); }
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(500);
  return await page.evaluate(v=>{const vv=eval(v);
    return {composer:(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')||{}).innerText,
      editingBanner:/Editing message/i.test(document.body.innerText)};}, V);
};
