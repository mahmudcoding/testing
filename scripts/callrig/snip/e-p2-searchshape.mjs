import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/search?q=probe&company_id=O4QEF1XTURESO01&workspace_id=${WS}&limit=3',{credentials:'include'});
    const d=await r.json(); const m=(d.messages||[])[0]||{};
    return { keys:Object.keys(m).join(','),
             sample:JSON.stringify(m).slice(0,420) }; })()`);
};
