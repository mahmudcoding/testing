import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/notifications?limit=6',{credentials:'include'});
    const d=await r.json();
    return (d.notifications||[]).slice(0,4).map(n=>({
      body:n.body, event:n.event_type,
      files:(n.payload||'').match(/"has_files":"[^"]*"/)?.[0]||'(no has_files)',
      created:n.created_at })); })()`);
};
