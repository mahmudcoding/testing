import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QEF1XTURESO01'; const mid=process.env.QA_MID;
  const out={steps:[]};
  const errs=[]; page.on('pageerror', e=>errs.push(String(e).slice(0,200)));
  page.on('console', m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,200)); });
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${mid}?tab=logs`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);
  const snap = async(label) => {
    await page.evaluate(DOM).catch(()=>{});
    const r = await page.evaluate(()=>{
      const q=window.__qa; const m=document.querySelector('main')||document.body;
      const t=(m.innerText||'').replace(/\s+/g,' ');
      return {len:t.length, text:t.slice(0,700),
        rows:(t.split('PERSON')[1]||'').match(/\d{1,2}:\d{2}:\d{2}\s?[AP]M/g)?.length||0,
        btns:[...m.querySelectorAll('button')].filter(q.vis).map(n=>q.nameOf(n).replace(/\s+/g,' ').slice(0,30)).length};
    }).catch(e=>({err:String(e).slice(0,150)}));
    out.steps.push({label, ...r});
  };
  await snap('initial');
  for (const f of ['^Screen share0$','^Files0$']) {
    const c = await page.evaluate((r)=>window.__qa.clickDeepest(new RegExp(r)), f);
    await page.waitForTimeout(2000);
    await snap('after click '+f+' ok='+c.ok+(c.ok?'':' '+c.why));
  }
  out.errs = errs.slice(0,8);
  return out;
};
