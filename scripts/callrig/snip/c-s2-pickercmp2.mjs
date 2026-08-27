export default async ({page, ctx}) => {
  try { return await run({page,ctx}); } finally { await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await ctx.setOffline(false);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const targets=await page.evaluate(()=>[...document.querySelectorAll('main [data-message-id]')]
    .slice(-2).map(e=>e.getAttribute('data-message-id')));
  const probe=async(label, mid)=>{
    const el=page.locator(`main [data-message-id="${mid}"]`);
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const add=el.locator('button[aria-label="Add reaction"]').first();
    if(!await add.count()) return {label, err:'no Add reaction'};
    await add.click(); await page.waitForTimeout(2800);
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
        panelText:panel?(panel.innerText||'').replace(/\s+/g,' ').slice(0,60):null};});
    return {label, mid, ...r};
  };
  out.online=await probe('online', targets[0]);
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  await ctx.setOffline(true); await page.waitForTimeout(1500);
  out.offline=await probe('offline', targets[1]);
  // if emojis are visible offline, click one and see whether it survives reconnect
  if(out.offline && out.offline.emojiVisible>0){
    const e=page.locator('[frimousse-emoji]:visible').first();
    out.offlineEmojiChar=await e.innerText();
    await e.click(); await page.waitForTimeout(2500);
    out.offlineAfterClick=await page.evaluate((mid)=>{
      const el=document.querySelector(`main [data-message-id="${mid}"]`);
      return el?(el.innerText||'').replace(/\s+/g,' ').slice(-30):'absent';}, targets[1]);
    await ctx.setOffline(false); await page.waitForTimeout(15000);
    out.serverAfter=await page.evaluate(async({ch,mid})=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'});
      const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===mid);
      return m?{body:m.body.slice(0,24), reactions:JSON.stringify(m.reactions||[]).slice(0,70)}:'absent';},
      {ch, mid:targets[1]});
  }
  return out;
};
