export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  // ── ALK-3507: a message pinned in Saved Messages cannot be unpinned
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(10000);
  const target=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const e=els[els.length-1];
    return e? {id:e.getAttribute('data-message-id'), t:(e.innerText||'').replace(/\s+/g,' ').slice(-30)}:null;});
  out.target=target;
  if(!target) return out;
  const menuOf=async(id)=>{
    const el=page.locator(`main [data-message-id="${id}"]`).first();
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const more=el.locator('button[aria-label="More actions"]').first();
    if(!await more.count()) return {err:'no More actions'};
    await more.click(); await page.waitForTimeout(1500);
    const items=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
      return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean):[];});
    return items;
  };
  out.menuBeforePin=await menuOf(target.id);
  // pin it via the menu
  const pin=page.getByText(/^Pin message$/).first();
  out.pinItemFound=await pin.count();
  if(out.pinItemFound){ await pin.click(); await page.waitForTimeout(4000); }
  else await page.keyboard.press('Escape');
  await page.reload(); await page.waitForTimeout(10000);
  out.afterPin=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector('main');
    return {banner:[...m.querySelectorAll('button,[role="button"]')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').slice(0,26)||b.getAttribute('aria-label'))
      .filter(t=>t&&/pin|View all/i.test(t)).slice(0,4)};});
  out.menuAfterPin=await menuOf(target.id);
  await page.keyboard.press('Escape');
  return out;
};
