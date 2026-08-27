import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const api = await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const own=await g('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100');
    const all=await g('/api/v1/users/me/files?workspace_id=${WS}&limit=100');
    const sh =await g('/api/v1/users/me/files?workspace_id=${WS}&scope=shared&limit=100');
    const sum=a=>(a||[]).reduce((s,x)=>s+(x.size||0),0);
    return {own:{n:(own.j&&own.j.files||[]).length, total:own.j&&own.j.total, tb:own.j&&own.j.total_bytes, sum:sum(own.j&&own.j.files)},
            all:{st:all.st, n:(all.j&&all.j.files||[]).length, total:all.j&&all.j.total, tb:all.j&&all.j.total_bytes, sum:sum(all.j&&all.j.files)},
            shared:{st:sh.st, n:(sh.j&&sh.j.files||[]).length, total:sh.j&&sh.j.total, tb:sh.j&&sh.j.total_bytes, sum:sum(sh.j&&sh.j.files)}}; })()`);
  const screen = await page.evaluate(`(() => { ${VISFN}
     const t=(document.querySelector('main').innerText||'').replace(/\\s+/g,' ');
     const m=t.match(/Storage[^|]{0,60}/);
     return {storage:m?m[0].trim():'(none)'}; })()`);
  return {api, screen};
};
