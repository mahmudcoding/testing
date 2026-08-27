import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{});
  const opened = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const t=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
      .find(x=>((x.querySelector('[data-testid="participant-name"]')||{}).textContent||'').trim()===n);
    if(!t) return {err:'no tile for '+n, have:[...ov.querySelectorAll('[data-testid="participant-name"]')].map(x=>x.textContent.trim())};
    t.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));
    const b=t.querySelector('[data-testid="participant-tile-card-trigger"]');
    if(!b) return {err:'no trigger'};
    b.click(); return {ok:true}; }, [who, VIS]);
  if (opened.err) return {opened};
  await page.waitForTimeout(2500);
  const menu = await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded')
      .filter(m=>{const n=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).length; return n>0&&n<=16;});
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    return {txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,160),
      items:[...m.querySelectorAll('[role="menuitem"],button')].filter(vis)
        .map(i=>(i.getAttribute('aria-label')||i.innerText||'').trim().replace(/\s+/g,' '))}; }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return {opened, menu};
};
