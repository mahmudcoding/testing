export default async ({page}) => {
  const id=process.env.MID;
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const m = page.locator(`[data-message-id="${id}"]`);
  await m.scrollIntoViewIfNeeded(); await m.hover(); await page.waitForTimeout(700);
  await m.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1200);
  const menu = await page.evaluate(v=>{const vv=eval(v);
    const c=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vv)
      .sort((a,b)=>b.innerText.length-a.innerText.length)[0];
    return c?{items:[...c.querySelectorAll('button')].filter(vv).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24))}:{noMenu:true};}, V);
  // click Edit by button text inside that container
  const editBtn = page.locator('button').filter({hasText:/^Edit$/}).last();
  await editBtn.click();
  await page.waitForTimeout(2000);
  const editUI = await page.evaluate(v=>{const vv=eval(v);
    const b=document.body.innerText;
    return {hasEditingBanner:/Editing message/i.test(b),
      buttons:[...document.querySelectorAll('button')].filter(vv).map(x=>(x.getAttribute('aria-label')||x.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/save|cancel|edit/i.test(t)).slice(0,10),
      composerText:(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')||{}).innerText};}, V);
  return {menu, editUI};
};
