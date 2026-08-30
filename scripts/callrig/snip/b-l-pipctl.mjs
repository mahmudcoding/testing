/* sector L: the PiP's own mic and camera buttons — do they act, and is their state right? */
import { DOM } from './lib.mjs';
const st = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const pip=document.querySelector('[data-testid="draggable-pip"]');
  const btn = n => { const b=pip?[...pip.querySelectorAll('button')].find(x=>new RegExp('^'+n+'$','i').test(q.nameOf(x).trim())):null;
    return b?{p:b.getAttribute('aria-pressed'), d:b.disabled, t:b.getAttribute('title')||null}:null; };
  const se=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    for(const t of pc.getSenders()) if(t.track) se.push({k:t.track.kind, en:t.track.enabled}); }
  return {mic:btn('Toggle microphone'), cam:btn('Toggle camera'), senders:se,
    pipTitle: pip?(pip.innerText||'').replace(/\s+/g,' ').slice(0,60):null};
});
const clickPip = async (page, name) => page.evaluate((n)=>{
  const q=window.__qa;
  const pip=document.querySelector('[data-testid="draggable-pip"]');
  if(!pip) return {ok:false,why:'no pip'};
  const b=[...pip.querySelectorAll('button')].find(x=>new RegExp('^'+n+'$','i').test(q.nameOf(x).trim()));
  if(!b) return {ok:false,why:'no button'};
  const r=b.getBoundingClientRect(); const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  b.click(); return {ok:true, topmost: top?(top===b||b.contains(top)||top.contains(b)):false};
}, name);
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.a = await st(page);
  out.micClick = await clickPip(page,'Toggle microphone');
  await page.waitForTimeout(2000);
  out.b_afterMic = await st(page);
  out.micClick2 = await clickPip(page,'Toggle microphone');
  await page.waitForTimeout(2000);
  out.c_afterMic2 = await st(page);
  out.camClick = await clickPip(page,'Toggle camera');
  await page.waitForTimeout(2500);
  out.d_afterCam = await st(page);
  out.camClick2 = await clickPip(page,'Toggle camera');
  await page.waitForTimeout(3000);
  out.e_afterCam2 = await st(page);
  return out;
};
