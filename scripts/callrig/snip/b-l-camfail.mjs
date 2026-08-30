/* sector L: the camera cannot be opened (NotAllowedError / NotReadableError) —
   what is the user told? Overrides gUM at runtime; proves the override is on the app's path. */
import { DOM } from './lib.mjs';
const st = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const g=t=>{const n=document.querySelector('[data-testid="'+t+'"]'); return n?{vis:q.boxVis(n), text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,240)}:null;};
  const cam=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim()));
  const se=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    for(const t of pc.getSenders()) if(t.track) se.push(t.track.kind+':'+t.track.enabled); }
  const tile=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>/\(you\)/.test(n.innerText||''));
  return {cam:cam?{n:q.nameOf(cam).trim(), p:cam.getAttribute('aria-pressed'), d:cam.disabled}:null,
    mediaErr:g('call-media-error-banner'), lifeErr:g('call-lifecycle-error-banner'),
    notices:q.notices().filter(n=>n.w>40&&n.h>16).map(n=>n.text.slice(0,160)),
    senders:se, blocked:(window.__blocked||0), gum:(window.__gumCalls||[]).length,
    myTile: tile?{hasVideo:!!tile.querySelector('video')}:null,
    dialogs:[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(q.boxVis)
      .map(n=>(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,180))};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  const err = process.env.QA_ERR || 'NotAllowedError';
  // make sure the camera is off first
  const a = await st(page);
  if(a.cam && a.cam.n==='Turn camera off'){
    await page.evaluate(()=>window.__qa.clickDeepest(/^Turn camera off$/i));
    await page.waitForTimeout(3000);
  }
  out.b_off = await st(page);
  // install the failure, keeping audio working
  out.install = await page.evaluate((name)=>{
    if(window.__origGum) return {ok:true, already:true};
    window.__blocked=0;
    window.__origGum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (c)=>{
      const wantsVideo = !!(c && c.video);
      if(wantsVideo){ window.__blocked++;
        const e = new DOMException('Permission denied', name); throw e; }
      return window.__origGum(c);
    };
    return {ok:true, already:false};
  }, err);
  // POSITIVE CONTROL: the override is on the path a direct call takes
  out.control = await page.evaluate(async ()=>{
    try{ const s=await navigator.mediaDevices.getUserMedia({video:true}); s.getTracks().forEach(t=>t.stop()); return 'STILL GRANTED'; }
    catch(e){ return e.name; }
  });
  const poll=[]; const t0=Date.now();
  const sample = async (tag)=>poll.push({dt:Date.now()-t0, tag, ...(await st(page))});
  await sample('pre'); await page.waitForTimeout(400); await sample('pre');
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Turn camera on$/i));
  for(let i=0;i<30;i++){ await page.waitForTimeout(500); await sample('post'); }
  out.poll=poll;
  // restore
  out.restore = await page.evaluate(()=>{ if(window.__origGum){ navigator.mediaDevices.getUserMedia=window.__origGum; delete window.__origGum; return 'ok'; } return 'none'; });
  return out;
};
