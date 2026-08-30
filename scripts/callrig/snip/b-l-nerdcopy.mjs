/* sector L: verbatim copy — the settings row, and the toolbar control it points at */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.panel = await page.evaluate(()=>{
    const q=window.__qa;
    const h=document.querySelector('[data-testid="call-debug-panel-header"]');
    const p=h?h.closest('[class*=fixed],[class*=absolute],aside,div'):null;
    return {header: h?(h.innerText||'').replace(/\s+/g,' ').trim().slice(0,200):null,
      headerVis: h?q.boxVis(h):false,
      sections:[...document.querySelectorAll('[data-testid^="call-debug-details-"],[data-testid^="call-debug-streams-"]')]
        .filter(q.boxVis).map(n=>({id:n.getAttribute('data-testid'), t:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,110)}))};
  });
  // close the panel and go to settings by in-app nav to read the copy verbatim
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]'); b&&b.click();});
  await page.waitForTimeout(1500);
  await page.evaluate(()=>window.__qa.clickDeepest(/^Minimize to picture-in-picture$/i));
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  await page.evaluate(()=>window.__qa.clickDeepest(/^Settings$/i));
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  await page.evaluate(()=>{
    const q=window.__qa;
    const a=[...document.querySelectorAll('a[href]')].filter(q.vis).find(n=>/\/settings\/calls$/.test(n.getAttribute('href')||''));
    a&&a.click();
  });
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  out.settingsUrl = page.url();
  out.settingsCopy = await page.evaluate(()=>{
    const q=window.__qa;
    const s=[...document.querySelectorAll('[role=switch]')].find(n=>/diagnostic/i.test(q.nameOf(n)));
    if(!s) return {ok:false};
    s.scrollIntoView({block:'center'});
    // smallest ancestor containing both the switch and the description text
    let n=s, best=null;
    for(let i=0;i<8&&n;i++,n=n.parentElement){
      const t=(n.innerText||'').replace(/\s+/g,' ').trim();
      if(/panel/i.test(t)){ best=n; break; }
    }
    return {ok:true, switchName:q.nameOf(s).replace(/\s+/g,' ').trim(),
      rowText: best?(best.innerText||'').replace(/\s+/g,' ').trim():null,
      checked:s.getAttribute('aria-checked'),
      sectionText:(()=>{const h=[...document.querySelectorAll('h1,h2,h3,h4')].find(x=>/diagnost/i.test(x.innerText||''));
        return h?(h.parentElement?.innerText||'').replace(/\s+/g,' ').trim().slice(0,300):null;})()};
  });
  return out;
};
