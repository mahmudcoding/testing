import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
    const j=await r.json();
    const arr=j.files||j.data||j.items||(Array.isArray(j)?j:[]);
    return {topKeys:Object.keys(j).slice(0,8), n:arr.length,
            itemKeys:arr[0]?Object.keys(arr[0]):[],
            first:arr[0]?JSON.stringify(arr[0]).slice(0,420):'-'}; })()`);
};
