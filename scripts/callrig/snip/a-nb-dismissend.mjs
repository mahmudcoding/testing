import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out = await page.evaluate((v)=>{const vis=eval(v);
    const o=document.querySelector('[data-testid="call-ended-overlay"]');
    if(!o) return {none:true};
    return {btns:[...o.querySelectorAll('button')].filter(vis).map(b=>((b.getAttribute('data-testid')||'')+'|'+(b.getAttribute('aria-label')||'')+'|'+(b.textContent||'').trim()).slice(0,60)),
            txt:(o.innerText||'').replace(/\s+/g,' ').slice(0,200)};}, VIS);
  if(out.none) return out;
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  out.afterEsc = await page.evaluate(()=>!!document.querySelector('[data-testid="call-ended-overlay"]'));
  return out;
};
