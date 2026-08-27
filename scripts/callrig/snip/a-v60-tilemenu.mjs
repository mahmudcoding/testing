const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const vids = await page.$$('video');
  // pick the remote tile (the second one is usually the other participant)
  await vids[vids.length-1].hover(); await page.waitForTimeout(900);
  const more = page.locator('button[aria-label="More"]').last();
  out.moreCount = await more.count();
  await more.click().catch(e=>out.err=String(e).slice(0,60));
  await page.waitForTimeout(1600);
  out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
    const items=[...document.querySelectorAll('[role="menuitem"],[role="menu"] button,[data-radix-menu-content] *')].filter(vis)
      .map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,30)).filter(Boolean);
    return [...new Set(items)].slice(0,14);},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/tile-menu.png'});
  return out;
};
