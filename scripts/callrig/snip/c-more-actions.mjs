// Compare "More actions" menu on alice's OWN message: channel she owns vs one she doesn't
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const out={};
  for(const [name,id] of [['qa-general (не владелец)','C4QCGENERAL0001'],['qa-private (владелец)','C4QCPRIVATE0001']]){
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`, {waitUntil:'load'});
    await page.waitForTimeout(3800);
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
    await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
    await comp.type('QA-C-PERM-'+id.slice(-4));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2500);
    const msg=page.locator('[data-message-id]').last();
    await msg.scrollIntoViewIfNeeded(); await msg.hover(); await page.waitForTimeout(700);
    await msg.locator('button[aria-label="More actions"]').first().click();
    await page.waitForTimeout(1500);
    out[name]=await page.evaluate(v=>{
      const vv=eval(v);
      const menu=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vv)
        .sort((a,b)=>b.innerText.length-a.innerText.length)[0];
      if(!menu) return {noMenu:true};
      return {items:[...menu.querySelectorAll('[role=menuitem],button')].filter(vv)
        .map(b=>(b.innerText||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,30)).filter(Boolean)};
    }, V);
    await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  }
  return out;
};
