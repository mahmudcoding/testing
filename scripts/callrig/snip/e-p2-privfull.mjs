import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/privacy', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const txt = await page.evaluate(`(() => {
     const m=document.querySelector('main')||document.body;
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('Who may reach you');
     return t.slice(i, i+1400); })()`);
  const api = await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const p=await g('/api/v1/users/me/presence-settings');
     return {st:p.st, body:JSON.stringify(p.j||{}).slice(0,260)}; })()`);
  return {txt, api};
};
