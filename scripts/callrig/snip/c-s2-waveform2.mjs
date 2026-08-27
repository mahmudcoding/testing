export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const measure=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>[...x.querySelectorAll('button')].some(b=>/voice-/.test(b.getAttribute('aria-label')||'')));
    if(!e) return {err:'not found'};
    const gfx=[...e.querySelectorAll('canvas,svg')].filter(v)
      .map(g=>({tag:g.tagName, w:Math.round(g.getBoundingClientRect().width),
        h:Math.round(g.getBoundingClientRect().height)}));
    return {wide:gfx.filter(g=>g.w>60), total:gfx.length,
      text:(e.innerText||'').replace(/\s+/g,' ').slice(0,50),
      buttons:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean)
        .filter(a=>/voice|Play|Pause/i.test(a))};});
  out.beforePlay=await measure();
  const play=page.locator('button[aria-label^="Play voice-"]').first();
  out.playFound=await play.count();
  if(out.playFound){
    await play.click();
    for(const ms of [1500,3000,5000]){
      await page.waitForTimeout(ms===1500?1500:1500);
      const m=await measure();
      out['at_'+ms]=m;
      if(m.wide && m.wide.length) break;
    }
  }
  out.afterPlay=await measure();
  return out;
};
