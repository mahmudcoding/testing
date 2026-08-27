import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const api = await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const m=await g('/api/v1/workspaces/${WS}/members?limit=50');
    const arr=(m.j&&(m.j.members||m.j.data||m.j.items))||[];
    return {st:m.st, n:arr.length, keys:arr[0]?Object.keys(arr[0]):[],
      roles:arr.slice(0,9).map(x=>({nm:(x.user&&x.user.name)||x.name, r:(x.user&&x.user.roles)||x.roles||null}))}; })()`);
  const screen = await page.evaluate(`(() => { ${VISFN}
     const rows=[...document.querySelectorAll('main [role=listitem], main li, main [class*=row]')]
       .filter(vis).filter(e=>/QA /.test(e.textContent||''));
     return rows.slice(0,9).map(r=>(r.innerText||'').replace(/\\s+/g,' ').slice(0,90)); })()`);
  return {api, screen};
};
