import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const closePanel = process.env.QA_CLOSEPANEL === '1';
  const out={};
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (closePanel && await t.count() && (await t.getAttribute('aria-pressed'))==='true'){ await t.click(); await page.waitForTimeout(1500); }
  if (!closePanel && await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  out.panelOpen = await t.getAttribute('aria-pressed');
  await page.mouse.move(700,500); await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator('[data-testid="call-overlay-expanded"] button[aria-label="More"]').last().click({force:true});
  await page.waitForTimeout(2200);
  out.click = await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded')
      .filter(m=>/Make co-host/i.test(m.innerText||''));
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    const i=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).find(x=>/Make co-host/i.test(x.innerText||''));
    if(!i) return {err:'no item'}; i.click(); return {ok:true}; }, VIS);
  await page.waitForTimeout(4000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {dialogs:ds.map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,140)),
      panel:p&&vis(p)?(p.innerText||'').replace(/\s+/g,' ').slice(0,120):null,
      menus:[...document.querySelectorAll('[role="menu"]')].filter(vis).length}; }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
