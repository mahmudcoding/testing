import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
     const j=await r.json(); const a=j.files||[];
     const rows=a.map(f=>({n:f.filename.slice(0,22), t:f.created_at, size:f.size}))
       .sort((x,y)=>(y.t>x.t?1:(y.t<x.t?-1:0)));
     // group by identical created_at
     const groups={};
     for(const x of rows){ (groups[x.t]=groups[x.t]||[]).push(x.n); }
     const ties=Object.entries(groups).filter(([t,v])=>v.length>1).map(([t,v])=>({t, files:v}));
     return {topByDate:rows.slice(0,6), ties}; })()`);
};
