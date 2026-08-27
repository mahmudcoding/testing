const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const boxes = await page.evaluate(()=>[...document.querySelectorAll('video')].map(v=>{const r=v.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), w:Math.round(r.width)};}));
  out.boxes=boxes;
  const b = boxes[boxes.length-1];
  await page.mouse.move(b.x, b.y); await page.waitForTimeout(1200);
  const mores = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button[aria-label="More"]')].filter(vis).map(b=>{const r=b.getBoundingClientRect();
      return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};});},VS);
  out.moreButtons=mores;
  if(!mores.length) return out;
  const target = mores.reduce((best,m)=> Math.abs(m.y-b.y)<Math.abs(best.y-b.y)?m:best, mores[0]);
  await page.mouse.click(target.x, target.y);
  await page.waitForTimeout(1800);
  out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
    const items=[...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(vis)
      .map(x=>(x.innerText||'').trim().replace(/\s+/g,' ').slice(0,32)).filter(Boolean);
    return [...new Set(items)];},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/tile-menu2.png'});
  return out;
};
