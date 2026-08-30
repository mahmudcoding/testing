/* sector L: camera denied — prove the denial is in force first, then watch what the user is told */
import { DOM } from './lib.mjs';
const st = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const g=t=>{const n=document.querySelector('[data-testid="'+t+'"]'); return n?{vis:q.boxVis(n), text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,220)}:null;};
  const cam=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim()));
  const se=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    for(const t of pc.getSenders()) if(t.track) se.push(t.track.kind+':'+t.track.enabled); }
  const tile=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>/\(you\)/.test(n.innerText||''));
  return {cam:cam?{n:q.nameOf(cam).trim(), p:cam.getAttribute('aria-pressed'), d:cam.disabled}:null,
    mediaErr:g('call-media-error-banner'), lifeErr:g('call-lifecycle-error-banner'),
    notices:q.notices().filter(n=>n.w>40&&n.h>16).map(n=>n.text.slice(0,150)),
    senders:se, pcs:(window.__pcs||[]).length, gum:(window.__gumCalls||[]).length,
    myTile: tile?{text:(tile.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), hasVideo:!!tile.querySelector('video'),
      vmute: (()=>{const v=tile.querySelector('[data-testid="video-muted-icon"]'); return v?q.boxVis(v):false;})()}:null};
});
export default async ({ page, ctx }) => {
  const out={};
  const cdp = await ctx.newCDPSession(page);
  out.origin = await page.evaluate(()=>location.origin);
  await cdp.send('Browser.setPermission', {origin: out.origin, permission:{name:'camera'}, setting:'denied'});
  // reload so the HOOK is installed on this document and the app re-reads permissions
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(DOM);
  const lj = await page.evaluate(()=>{const b=document.querySelector('[data-testid="lobby-join"]'); if(!b) return false; b.click(); return true;});
  if(lj) await page.waitForTimeout(8000);
  await page.evaluate(DOM);
  // INSTRUMENT CHECK: is the denial actually in force?
  out.permCheck = await page.evaluate(async ()=>{
    let perm=null; try{ perm=(await navigator.permissions.query({name:'camera'})).state; }catch(e){ perm='query-failed:'+String(e).slice(0,40); }
    let gumErr=null;
    try{ const s=await navigator.mediaDevices.getUserMedia({video:true}); s.getTracks().forEach(t=>t.stop()); gumErr='GRANTED'; }
    catch(e){ gumErr=e.name+': '+String(e.message).slice(0,60); }
    return {permissionState:perm, directGum:gumErr};
  });
  out.a_start = await st(page);
  if(out.a_start.cam && out.a_start.cam.n==='Turn camera off'){
    await page.evaluate(()=>window.__qa.clickDeepest(/^Turn camera off$/i));
    await page.waitForTimeout(2500);
  }
  out.b_off = await st(page);
  const poll=[]; const t0=Date.now();
  const sample = async (tag)=>poll.push({dt:Date.now()-t0, tag, ...(await st(page))});
  await sample('pre'); await page.waitForTimeout(400); await sample('pre');
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Turn camera on$/i));
  for(let i=0;i<24;i++){ await page.waitForTimeout(500); await sample('post'); }
  out.poll=poll;
  await cdp.send('Browser.setPermission', {origin: out.origin, permission:{name:'camera'}, setting:'granted'});
  return out;
};
