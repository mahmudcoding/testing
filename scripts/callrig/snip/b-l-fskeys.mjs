/* sector L: fullscreen + auto-hidden toolbar — can a keyboard user reach the controls? */
import { DOM } from './lib.mjs';
const probe = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const t=document.querySelector('[data-testid="call-toolbar"]');
  const btns=t?[...t.querySelectorAll('button')]:[];
  const ae=document.activeElement;
  return {toolbarOpacity:t?q.opacity(t):null, toolbarY:t?Math.round(t.getBoundingClientRect().top):null,
    toolbarBtnCount:btns.length,
    focusable: btns.filter(b=>!b.disabled && b.tabIndex>=-1).length,
    tabIndexes:[...new Set(btns.map(b=>b.tabIndex))],
    inertAncestor: t?(()=>{let n=t; while(n){ if(n.inert || n.getAttribute&&n.getAttribute('aria-hidden')==='true') return n.tagName+'/'+(n.getAttribute('data-testid')||''); n=n.parentElement;} return null;})():null,
    activeEl: ae?{tag:ae.tagName, name:q.nameOf(ae).trim().slice(0,40), inToolbar: t?t.contains(ae):false}:null,
    visibleButtons:[...document.querySelectorAll('button')].filter(q.vis).map(b=>q.nameOf(b).trim().slice(0,30))};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  const fs = await page.evaluate(()=>!!document.fullscreenElement);
  if(!fs){ await page.evaluate(()=>document.querySelector('[data-testid="call-surface-fullscreen"]').click()); await page.waitForTimeout(2000); }
  // reveal then let it hide
  await page.mouse.move(900,500); await page.waitForTimeout(500);
  await page.mouse.move(905,505); await page.waitForTimeout(500);
  out.revealed = await probe(page);
  await page.evaluate(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();});
  await page.waitForTimeout(4000);
  out.hidden = await probe(page);
  // now Tab, without moving the pointer
  const tabs=[];
  for(let i=0;i<12;i++){
    await page.keyboard.press('Tab');
    await page.waitForTimeout(250);
    const p = await probe(page);
    tabs.push({i, opacity:p.toolbarOpacity, y:p.toolbarY, active:p.activeEl});
  }
  out.tabs = tabs;
  out.afterTabs = await probe(page);
  out.exit = await page.evaluate(async ()=>{ try{ await document.exitFullscreen(); return 'ok'; }catch(e){ return String(e).slice(0,50); } });
  await page.waitForTimeout(1500);
  return out;
};
