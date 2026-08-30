/* Click each ACTIVITY filter and each PERSON chip on the Logs tab; report row counts. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QEF1XTURESO01'; const mid=process.env.QA_MID;
  const out={steps:[]};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${mid}?tab=logs`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);
  const read = async (label) => {
    const r = await page.evaluate(()=>{
      const m=document.querySelector('main')||document.body;
      const t=(m.innerText||'').replace(/\s+/g,' ');
      const i=t.indexOf('PERSON');
      const tail=t.slice(i);
      const rows=(tail.match(/\d{1,2}:\d{2}:\d{2}\s?[AP]M/g)||[]).length;
      const q=window.__qa;
      const chips=[...m.querySelectorAll('button')].filter(q.vis)
        .map(n=>({n:q.nameOf(n).replace(/\s+/g,' ').slice(0,40),
                  press:n.getAttribute('aria-pressed'), sel:n.getAttribute('aria-selected'),
                  cls:(typeof n.className==='string'?n.className:'').includes('bg-')?'styled':''}))
        .filter(x=>/^(All|People|Screen share|Files|Recording|Meeting|Everyone|QB|QA)/.test(x.n));
      return {rows, tail: tail.slice(0, 900), chips};
    });
    out.steps.push({label, ...r});
  };
  await read('initial');
  for (const f of ['^People', '^Screen share', '^Files', '^Recording\\d', '^Meeting\\d', '^All\\d']) {
    const c = await page.evaluate((r)=>window.__qa.clickDeepest(new RegExp(r)), f);
    await page.waitForTimeout(1500);
    await page.evaluate(DOM);
    await read('filter '+f+' click='+(c.ok?'ok':c.why));
  }
  for (const p of ['^QBQA Bob', '^QAQA Alice', '^Everyone']) {
    const c = await page.evaluate((r)=>window.__qa.clickDeepest(new RegExp(r)), p);
    await page.waitForTimeout(1500);
    await page.evaluate(DOM);
    await read('person '+p+' click='+(c.ok?'ok':c.why));
  }
  return out;
};
