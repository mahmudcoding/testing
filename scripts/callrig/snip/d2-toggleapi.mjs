import { safeClick } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01', idx=Number(process.env.QA_IDX||1);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const api = () => page.evaluate(async()=>await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json());
  const out={before: await api()};
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(r.request().method()!=='GET') reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  out.click = (await safeClick(page,'[role=switch]',{index:idx})).ok;
  for (const t of [1000,3000,5000,9000,15000]) {
    await page.waitForTimeout(t===1000?1000:t-(out.samples?out.samples[out.samples.length-1].t:0));
    (out.samples=out.samples||[]).push({t, api: await api()});
  }
  page.off('response', on);
  out.reqs = reqs.filter(r=>!/rum/.test(r));
  return out;
};
