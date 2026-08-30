/* sector L: reload a client and confirm it is back in the call */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const before = page.url();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(DOM);
  const st = await page.evaluate(()=>{
    const q=window.__qa;
    return {url:location.pathname, tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].length,
      surf: !!document.querySelector('[data-testid="call-surface"]'),
      pip: !!document.querySelector('[data-testid="draggable-pip"]'),
      lobbyJoin: !!document.querySelector('[data-testid="lobby-join"]'),
      camBtn:(()=>{const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim())); return b?q.nameOf(b).trim():null;})(),
      prompt: !!document.querySelector('[data-testid="call-quality-prompt"]')};
  });
  // if we landed in the lobby, join
  if(st.lobbyJoin){
    await page.evaluate(()=>document.querySelector('[data-testid="lobby-join"]').click());
    await page.waitForTimeout(8000);
    await page.evaluate(DOM);
  }
  const after = await page.evaluate(()=>{
    const q=window.__qa;
    return {url:location.pathname, tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].length,
      surf: !!document.querySelector('[data-testid="call-surface"]'),
      camBtn:(()=>{const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim())); return b?q.nameOf(b).trim():null;})(),
      prompt: !!document.querySelector('[data-testid="call-quality-prompt"]')};
  });
  return {before, afterReload:st, final:after};
};
