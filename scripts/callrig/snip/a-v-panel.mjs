// Verify pass: read the Side Rooms panel with its section headers, in DOM order.
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}if(op<=0.05)return false;const cx=r.left+r.width/2,cy=r.top+r.height/2;if(cx<0||cy<0||cx>innerWidth||cy>innerHeight)return false;const h=document.elementFromPoint(cx,cy);return !!h&&(el.contains(h)||h.contains(el));}`;
export default async ({ page }) => {
  const out={};
  const open = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=document.querySelector('[data-testid="side-rooms-new"]'); return !!b&&vis(b);},VS);
  if(!open){
    await page.locator('button[aria-label="Side Rooms"]').first().click().catch(()=>{});
    await page.waitForTimeout(2600);
  }
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const anchor=document.querySelector('[data-testid="side-rooms-new"]');
    if(!anchor) return {err:'panel not open'};
    const p=anchor.closest('aside')||anchor.parentElement.parentElement;
    return {text:(p.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean),
      buttons:[...p.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,26))+(b.getAttribute('data-testid')?' {'+b.getAttribute('data-testid')+'}':''))};},VS);
  return out;
};
