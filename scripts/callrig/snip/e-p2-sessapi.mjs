import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/sessions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(`(async () => {
    const r = await fetch('/api/v1/security/sessions', {credentials:'include'});
    const t = await r.text();
    let d=null; try{d=JSON.parse(t);}catch(e){return {st:r.status, raw:t.slice(0,900)};}
    const s = d.sessions||d.data||[];
    return { st:r.status, count:s.length, keys:Object.keys(s[0]||{}).join(','),
             first: s[0] ? JSON.stringify(s[0]).slice(0,600) : null };
  })()`);
};
