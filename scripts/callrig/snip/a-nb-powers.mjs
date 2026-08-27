import { VIS } from './a-nb-lib.mjs';
// What moderation powers does THIS client have right now?
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{});
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  const toolbar = await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return [...ov.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().replace(/\s+/g,' ').slice(0,26))
      .filter(x=>/^(End for everyone|Leave call|Record|Meeting settings|Side Rooms|Add to call|Participants|Call chat)$/.test(x)); }, VIS);
  const opened = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]'); if(!p) return {err:'no panel'};
    const row=[...p.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(n))
      .filter(e=>[...e.querySelectorAll('button')].some(b=>/Participant actions/i.test(b.getAttribute('aria-label')||'')))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!row) return {err:'no row for '+n};
    row.querySelector('button[aria-label*="Participant actions"]').click(); return {ok:true}; }, [who, VIS]);
  await page.waitForTimeout(2200);
  const menu = await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    return [...m.querySelectorAll('[role="menuitem"],button')].filter(vis)
      .map(i=>(i.getAttribute('aria-label')||i.innerText||'').trim().replace(/\s+/g,' ')); }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return {toolbar, opened, menu};
};
