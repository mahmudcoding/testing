import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const errs=[];
  page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,90)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const me=await g('/api/v1/auth/me');
    const mem=performance.memory?{usedMB:Math.round(performance.memory.usedJSHeapSize/1048576),
                                  limitMB:Math.round(performance.memory.jsHeapSizeLimit/1048576)}:null;
    // realtime: count open WebSockets via the app's own state if exposed, else check readyState of any tracked
    const nav=performance.getEntriesByType('navigation')[0];
    return {
      authSt: me.st,
      email: me.j&&(me.j.user?me.j.user.email:me.j.email),
      memory: mem,
      domNodes: document.getElementsByTagName('*').length,
      loadedAt: new Date().toISOString(),
      pageAgeMs: Math.round(performance.now()),
      navType: nav?nav.type:null,
      visibility: document.visibilityState,
      messagesRendered: document.querySelectorAll('[data-message-id]').length
    }; })()`).then(r=>({...r, consoleErrors:errs.slice(0,4)}));
};
