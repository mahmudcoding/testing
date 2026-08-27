const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-FWDIMG'}).last();
  out.found=await el.count();
  if(!out.found) return out;
  const id=await el.getAttribute('data-message-id');
  out.id=id;

  // 1. Pin it, then read the pinned panel
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(800);
  const pin=page.locator('[role="menu"]').getByText('Pin message',{exact:true}).first();
  out.pinOffered=await pin.count();
  if(out.pinOffered){ await pin.click(); await page.waitForTimeout(2500); }
  else await page.keyboard.press('Escape');
  out.pinnedStrip = await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const hits=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/Pinned|View all/i.test(t)&&t.length<40);
    return [...new Set(hits)];
  });
  // open the pinned list
  const va=page.locator('button').filter({hasText:/View all/}).first();
  out.viewAll=await va.count();
  if(out.viewAll){ await va.click(); await page.waitForTimeout(2200);
    out.pinnedPanel=await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30)
        ||document.querySelector('main');
      const e=[...d.querySelectorAll('*')].find(x=>/QA-S2-FWDIMG/.test(x.textContent||''));
      const scope=e? (e.closest('[data-message-id]')||e):null;
      return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,140),
        imgs:scope? scope.querySelectorAll('img').length:null,
        fileBtns:scope? [...scope.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
          .filter(l=>l&&/Preview|Download|Open q/.test(l)).length:null};});
    await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  }

  // 2. Reply to it and read the quote
  const el2=page.locator(`[data-message-id="${id}"]`).first();
  await el2.scrollIntoViewIfNeeded(); await el2.hover(); await page.waitForTimeout(500);
  await el2.locator('button[aria-label="Reply"]').first().click();
  await page.waitForTimeout(2500);
  out.threadParentShape=await page.evaluate((id)=>{
    const nodes=[...document.querySelectorAll(`[data-message-id="${id}"]`)]
      .filter(e=>e.getBoundingClientRect().x>900);
    const e=nodes[0];
    return e? {imgs:e.querySelectorAll('img').length,
      fileBtns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
        .filter(l=>l&&/Preview|Download|Open q/.test(l)).length,
      txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,70)}:'parent not in panel';}, id);
  return out;
};
