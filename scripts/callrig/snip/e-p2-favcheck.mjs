import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  return await page.evaluate(`(async () => {
    const out={};
    for(const scope of ['own','accessible']){
      const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope='+scope+'&limit=100',{credentials:'include'});
      const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){ out[scope]='parse'; continue; }
      const a=d.files||d.data||[];
      const f=a.find(x=>/bob-shared/.test(x.filename||x.name||''));
      out[scope]={n:a.length, bobFile: f? {fav:f.is_favorite??f.favorite??'(no field)', keys:Object.keys(f).join(',').slice(0,110)} : '(not in this scope)'};
    }
    return out; })()`);
};
