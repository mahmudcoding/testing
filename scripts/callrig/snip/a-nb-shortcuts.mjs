import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,500); await page.waitForTimeout(500);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return [...ov.querySelectorAll('button,[title]')].filter(vis)
      .map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,26), title:(b.getAttribute('title')||'').slice(0,60)}))
      .filter(x=>x.title && /[⌘⌥⇧^]|Ctrl|Alt|Shift|\(/.test(x.title)); }, VIS);
};
