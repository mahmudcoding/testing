import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    // smallest visible element holding each member name
    const names=['QA Admin','QA Alice','QA Bob','QA Carol','QA Guest','QA Owner','QA Dave'];
    const out={};
    for (const n of names) {
      const c=[...d.querySelectorAll('*')].filter(window.__qa.boxVis).filter(x=>(x.innerText||'').includes(n));
      c.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
      const row=c[0]; if(!row){ out[n]=null; continue; }
      const inter=[...row.querySelectorAll('button,input,[role=checkbox],[role=option]')];
      out[n]={ text:(row.innerText||'').replace(/\s+/g,' ').trim().slice(0,50), tag:row.tagName,
               disabled: row.disabled ?? row.getAttribute('aria-disabled'),
               dataDisabled: row.getAttribute('data-disabled'),
               interactives: inter.map(i=>({tag:i.tagName, dis:i.disabled??i.getAttribute('aria-disabled'), t:(i.innerText||'').trim().slice(0,20)})) };
    }
    return out;
  });
};
