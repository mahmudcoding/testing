export default async ({page, ctx}) => {
  try { return await run({page,ctx}); } finally { await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const probe=async(label)=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(8000);
    const els=await page.evaluate(()=>[...document.querySelectorAll('main [data-message-id]')]
      .slice(-1).map(e=>e.getAttribute('data-message-id')));
    const el=page.locator(`main [data-message-id="${els[0]}"]`);
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const add=el.locator('button[aria-label="Add reaction"]').first();
    const has=await add.count();
    if(!has) return {label, err:'no Add reaction'};
    await add.click(); await page.waitForTimeout(2500);
    const r=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
        let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
          o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
        return o>0.05;};
      const all=[...document.querySelectorAll('[frimousse-emoji]')];
      const vis=all.filter(v);
      const panel=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].filter(v)[0];
      return {emojiNodes:all.length, emojiVisible:vis.length,
        firstVisible:vis[0]?vis[0].innerText:null,
        panelText:panel?(panel.innerText||'').replace(/\s+/g,' ').slice(0,70):null};});
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
    return {label, target:els[0], ...r};
  };
  await ctx.setOffline(false);
  out.online=await probe('online');
  await ctx.setOffline(true); await page.waitForTimeout(1500);
  out.offline=await probe('offline');
  return out;
};
