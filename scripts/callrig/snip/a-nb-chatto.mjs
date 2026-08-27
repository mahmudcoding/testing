import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const pick = process.env.QA_TO || null;
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2200); }
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const b=[...p.querySelectorAll('button')].filter(vis).find(x=>/^To$/.test((x.getAttribute('aria-label')||'').trim()));
    if(b) b.click(); }, VIS);
  await page.waitForTimeout(1800);
  const list = await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-menu-content]')].filter(vis);
    const m=ms[ms.length-1]; if(!m) return {err:'no list'};
    return {items:[...m.querySelectorAll('[role="menuitem"],[role="option"],button')].filter(vis)
      .map(i=>(i.getAttribute('aria-label')||i.innerText||'').trim().replace(/\s+/g,' ').slice(0,40))}; }, VIS);
  if (!pick || list.err) return {list};
  const clicked = await page.evaluate(([name,v])=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-menu-content]')].filter(vis);
    const m=ms[ms.length-1]; if(!m) return {err:'no list'};
    const i=[...m.querySelectorAll('[role="menuitem"],[role="option"],button')].filter(vis)
      .find(x=>(x.innerText||'').trim().includes(name));
    if(!i) return {err:'no item '+name}; i.click(); return {ok:true}; }, [pick, VIS]);
  await page.waitForTimeout(1500);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return (p?.innerText||'').replace(/\s+/g,' ').slice(0,200);});
  return {list, clicked, after};
};
