import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const close = process.env.QA_CLOSE === '1';
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (close && await t.count() && (await t.getAttribute('aria-pressed'))==='true'){ await t.click(); await page.waitForTimeout(1500); }
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const b=document.querySelector('[data-testid="call-controls-chat-toggle"]');
    if(!b) return {err:'no chat button'};
    return {pressed:b.getAttribute('aria-pressed'), al:b.getAttribute('aria-label'),
      txt:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24),
      badges:[...b.querySelectorAll('*')].filter(e=>!e.childElementCount).map(e=>(e.textContent||'').trim()).filter(Boolean),
      allTxt:[...document.querySelectorAll('*')].filter(e=>!e.childElementCount).filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(t=>/unread|new message/i.test(t)).slice(0,4)}; }, VIS);
};
