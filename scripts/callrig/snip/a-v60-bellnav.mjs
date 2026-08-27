const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  out.urlBefore = await page.evaluate(()=>location.pathname+location.search);
  const item = page.locator('button', { hasText: /Attendee accepted/ }).first();
  out.itemFound = await item.count()>0;
  if(out.itemFound){
    await item.click();
    const poll=[]; for(let i=0;i<10;i++){ poll.push(await page.evaluate(()=>location.pathname+location.search)); await page.waitForTimeout(500); }
    out.urlPoll=[...new Set(poll)];
    out.after = await page.evaluate((vs)=>{const vis=eval(vs);
      return { url:location.pathname+location.search,
        dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,150)),
        mainTxt:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,140) };},VS);
  }
  // reopen bell and mark all read
  await page.locator('button[aria-label^="Notifications"]').first().click().catch(()=>{});
  await page.waitForTimeout(2500);
  const mark = page.locator('button', { hasText: /^Mark all as read$/ }).first();
  out.markFound = await mark.count()>0;
  if(out.markFound){ await mark.click(); await page.waitForTimeout(4000); }
  out.afterMark = await page.evaluate(async()=>{
    const lbl=[...document.querySelectorAll('button[aria-label]')].map(b=>b.getAttribute('aria-label')).find(a=>/^Notifications/.test(a||''));
    const a=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
    const j=await a.json().catch(()=>null); const arr=j?.notifications||[];
    return { bellLabel:lbl, apiUnread:arr.filter(x=>!x.read).length, apiTotal:arr.length };});
  return out;
};
