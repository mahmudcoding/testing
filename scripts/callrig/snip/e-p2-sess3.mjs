import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/sessions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
    const j=await r.json(); const a=(j.sessions||[])[0]||{};
    return {device_id:a.device_id===undefined?'absent':a.device_id,
            is_current:a.is_current,
            hasDeviceName:Object.keys(a).some(k=>/device_name|platform|browser|os/i.test(k)),
            allKeys:Object.keys(a)}; })()`);
};
