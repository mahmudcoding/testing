export default async ({page}) => {
  const id=process.env.MID;
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const m = page.locator(`[data-message-id="${id}"]`);
  await m.scrollIntoViewIfNeeded(); await m.hover(); await page.waitForTimeout(700);
  await m.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1200);
  await page.locator('button').filter({hasText:/^Delete$/}).last().click();
  await page.waitForTimeout(1600);
  const confirm = await page.evaluate(v=>{const vv=eval(v);
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vv)[0];
    return d?{text:d.innerText.replace(/\s+/g,' ').slice(0,150), btns:[...d.querySelectorAll('button')].filter(vv).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim().slice(0,20))}:{noDialog:true};}, V);
  if(!confirm.noDialog){
    const del = page.locator('[role=dialog] button, [role=alertdialog] button').filter({hasText:/^Delete$/}).last();
    if(await del.count()) await del.click();
    else { const b=page.locator('[role=dialog] button[aria-label*="Delete" i]').first(); if(await b.count()) await b.click(); }
  }
  await page.waitForTimeout(2800);
  const gone = await page.evaluate(m=>!document.querySelector(`[data-message-id="${m}"]`), id);
  return {confirmDialog: confirm, goneForAuthor: gone};
};
