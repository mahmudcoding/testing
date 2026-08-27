const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  // hover the first remote video tile to reveal its controls
  const vids = await page.$$('video');
  const out={ videoCount: vids.length };
  for(let i=0;i<vids.length;i++){
    await vids[i].hover().catch(()=>{});
    await page.waitForTimeout(900);
    const c = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').slice(0,34))
        .filter(a=>/pin|spotlight|fullscreen|more|maximi/i.test(a));},VS);
    out['tile'+i]=c;
  }
  out.allPinish = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30))
      .filter(a=>/pin|show more|spotlight/i.test(a));},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/alice-grid.png'});
  return out;
};
