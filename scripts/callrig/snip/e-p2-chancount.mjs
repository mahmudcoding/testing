import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/directories?tab=channels', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const screen = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const rows=[...m.querySelectorAll('*')].filter(vis).filter(e=>{
       const t=(e.innerText||'').replace(/\\s+/g,' ').trim();
       return /^(qa-general|qa-private|qa-empty|e-arch)/.test(t) && t.length<90
              && e.getBoundingClientRect().height<120; });
     const seen=new Set(); const out=[];
     for(const r of rows){ const t=(r.innerText||'').replace(/\\s+/g,' ').trim();
       const name=(t.match(/^[a-z0-9-]+/)||[''])[0];
       if(name && !seen.has(name)){ seen.add(name); out.push({name, text:t.slice(0,70)}); } }
     return out.slice(0,6); })()`);
  const api = await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const c=await g('/api/v1/workspaces/${WS}/channels');
     const arr=(c.j&&(c.j.channels||c.j.data||c.j.items))||[];
     const out=[];
     for(const ch of arr.slice(0,4)){
       const m=await g('/api/v1/channels/'+ch.id+'/members');
       const mem=(m.j&&(m.j.members||m.j.data||m.j.items))||[];
       out.push({name:ch.name, apiMembers:mem.length, st:m.st,
                 fieldOnChannel:ch.member_count===undefined?'absent':ch.member_count});
     }
     return out; })()`);
  return {screen, api};
};
