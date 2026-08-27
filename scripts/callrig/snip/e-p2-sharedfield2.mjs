import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=50',{credentials:'include'});
    const d=await r.json(); const a=d.files||[];
    const f=a.find(x=>/bob-shared/.test(x.filename||''));
    if(!f) return '(not found)';
    return {filename:f.filename, shared_with:JSON.stringify(f.shared_with).slice(0,200), context_id:f.context_id}; })()`);
};
