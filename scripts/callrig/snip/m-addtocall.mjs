import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const b = await page.$('button[aria-label="Add to call"]');
  if (!b) return {err:'no Add to call button'};
  const bb = await b.boundingBox();
  await page.mouse.click(bb.x+bb.width/2, bb.y+bb.height/2);
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)
      .filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded')
      .sort((a,b)=>T(a).length-T(b).length)[0];
    if(!d) return {noDialog:true};
    // rows: elements naming a fixture person
    const names=[...new Set([...d.querySelectorAll('*')].map(e=>T(e)).filter(t=>/^QA (Owner|Alice|Bob|Carol|Dave|Admin|Guest|Outsider)\b/.test(t)&&t.length<80))];
    return {text:T(d).slice(0,1200), names,
      controls:[...d.querySelectorAll('button,input,[role=checkbox]')].filter(vis).map(x=>({
        tag:x.tagName, l:(x.getAttribute('aria-label')||x.textContent||x.placeholder||'').replace(/\s+/g,' ').trim().slice(0,50),
        d:x.disabled||x.getAttribute('aria-disabled')==='true', st:x.getAttribute('data-state')||x.getAttribute('aria-checked')}))};
  });
  return r;
};
