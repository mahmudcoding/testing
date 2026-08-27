import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(function(){
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const counts={};
    for (const sel of ['tbody tr','[data-testid]','[role=row]','li','article','[class*=fileRow]','[class*=FileRow]','[class*=file-]']) {
      counts[sel]=document.querySelectorAll(sel).length;
    }
    const testids=[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,18);
    const tabs=[...document.querySelectorAll('button,[role=tab]')].map(b=>(b.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x&&x.length<24).slice(0,20);
    return {probeVisible: t.includes('qa-e-reconnect-probe'), counts, testids, tabs, head:t.slice(0,190)};
  });
};
