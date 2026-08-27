import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const dom = await page.evaluate(`(() => { ${VISFN}
     const navs=[...document.querySelectorAll('nav')];
     return navs.map((nv,i)=>({i,
       items:[...nv.querySelectorAll('a,button')].filter(vis).map(e=>({
         al:(e.getAttribute('aria-label')||'').slice(0,30),
         tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,34),
         href:(e.getAttribute('href')||'').slice(-28)})).slice(0,16)})); })()`);
  const api = await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const un=await g('/api/v1/workspaces/${WS}/unread');
     const nf=await g('/api/v1/notifications?limit=100');
     const fl=await g('/api/v1/users/me/files?workspace_id=${WS}&limit=100');
     const nlist=(nf.j&&(nf.j.notifications||nf.j.data||nf.j.items))||[];
     return {unreadKeys:un.j?Object.keys(un.j).slice(0,6):null,
             unreadRaw:JSON.stringify(un.j||{}).slice(0,300),
             nNotif:nlist.length, nUnreadNotif:nlist.filter(x=>!x.read_at&&!x.is_read).length,
             nFiles:(fl.j&&fl.j.files||[]).length, fileTotal:fl.j&&fl.j.total}; })()`);
  return {dom, api};
};
