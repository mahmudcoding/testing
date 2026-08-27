import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,500); await page.waitForTimeout(600);
  await page.keyboard.press('Escape').catch(()=>{});
  const info = await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const bs=[...ov.querySelectorAll('button')].filter(vis)
      .filter(b=>/^More$/.test((b.getAttribute('aria-label')||'').trim()));
    return bs.map(b=>{const r=b.getBoundingClientRect();
      return {tid:b.getAttribute('data-testid'), box:`${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`,
              disabled:b.disabled, cls:String(b.className||'').slice(0,60)};}); }, VIS);
  if (!info.length) return {err:'no visible More'};
  const b = page.locator('[data-testid="call-overlay-expanded"] button[aria-label="More"]').last();
  await b.click({force:true}).catch(()=>{});
  await page.waitForTimeout(2500);
  const menu = await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded')
      .filter(m=>{const n=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).length; return n>0&&n<=20;});
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    return {items:[...m.querySelectorAll('[role="menuitem"],button')].filter(vis)
      .map(i=>(i.getAttribute('aria-label')||i.innerText||'').trim().replace(/\s+/g,' ').slice(0,40))}; }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return {info, menu};
};
