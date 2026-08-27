import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\//.test(u)&&/session/i.test(u))
    net.push(r.request().method()+' '+r.status()+' '+decodeURIComponent(u.split('/api/v1/')[1]).slice(0,60)); });
  await page.goto(BASE+'/w/'+WS+'/settings/sessions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.url = page.url().replace(BASE,'');
  out.net = [...new Set(net)].slice(0,4);
  out.screen = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main')||document.body;
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const els=[...m.querySelectorAll('button,a,[role=switch],[role=tab]')].filter(vis)
       .map(e=>({tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,30),
                 al:(e.getAttribute('aria-label')||'').slice(0,26), dis:e.disabled}))
       .filter(e=>e.tx||e.al);
     return {text:t.slice(0,420), n:els.length, els:els.slice(0,14)}; })()`);
  out.api = await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const s=await g('/api/v1/auth/sessions');
     const arr=(s.j&&(s.j.sessions||s.j.data||s.j.items))||(Array.isArray(s.j)?s.j:[]);
     return {st:s.st, n:arr.length, keys:arr[0]?Object.keys(arr[0]):[],
             sample:arr.slice(0,3).map(x=>JSON.stringify(x).slice(0,180))}; })()`);
  return out;
};
