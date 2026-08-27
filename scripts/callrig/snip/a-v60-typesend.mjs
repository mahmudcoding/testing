const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const open = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
    return d? /Message everyone/.test(d.innerText||'') : false;},VS);
  if(!open){ await page.locator('button[aria-label="Call chat"]').first().click().catch(()=>{}); await page.waitForTimeout(2800); }
  const ta = await page.$('textarea');
  if(!ta) return {noComposer:true};
  await ta.click();
  // type slowly so the typing indicator has time to propagate
  for(const ch of 'hello from the guest'){ await page.keyboard.type(ch,{delay:180}); }
  await page.waitForTimeout(4000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  return { typed:true };
};
