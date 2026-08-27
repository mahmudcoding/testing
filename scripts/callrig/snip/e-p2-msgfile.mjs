import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/c/C4QEPRIVATE0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  out.messages = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('[data-message-id]')].map(m=>({
      id:m.getAttribute('data-message-id').slice(0,16),
      text:(m.innerText||'').replace(/\\s+/g,' ').trim().slice(0,90),
      imgs:[...m.querySelectorAll('img')].map(i=>i.naturalWidth+'x'+i.naturalHeight+' '+String(i.getAttribute('src')||'').slice(0,44)),
      vis: vis(m)
    })).slice(-4); })()`);
  out.apiMsgs = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/channels/C4QEPRIVATE0001/messages?limit=10',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.messages||j.data||[];
    return a.slice(-3).map(m=>({id:String(m.id).slice(0,14), body:String(m.body||'').slice(0,30),
      files:(m.files||[]).map(f=>({id:String(f.id).slice(0,16), name:f.filename||f.name, url:String(f.url||f.content_url||'').slice(0,40)}))})); })()`);
  return out;
};
