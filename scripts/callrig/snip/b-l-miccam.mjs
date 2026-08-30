/* sector L: toggle mic or camera and measure both the control state and the media */
import { DOM, RTC_STATS } from './lib.mjs';
const read = async (page) => {
  const btns = await page.evaluate(()=>{
    const w=window.__qa;
    const pick = re => { const b=[...document.querySelectorAll('button')].filter(w.vis).find(x=>re.test(w.nameOf(x).trim()));
      return b?{n:w.nameOf(b).trim(),p:b.getAttribute('aria-pressed'),d:b.disabled}:null; };
    return {mic:pick(/^(Mute|Unmute)$/i), cam:pick(/^Turn camera (on|off)$/i)};
  });
  const senders = await page.evaluate(()=>{
    const r=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
      for(const s of pc.getSenders()) if(s.track) r.push({k:s.track.kind,en:s.track.enabled,mu:s.track.muted,st:s.track.readyState,lab:(s.track.label||'').slice(0,40)}); }
    return r;
  });
  const rtc = await page.evaluate(`(${RTC_STATS})()`);
  const out = {t:Date.now(), btns, senders, gum:rtc.gum,
    outRtp: rtc.stats.flatMap(s=>s.out).map(o=>({k:o.kind,b:o.bytes,p:o.packets,fps:o.fps,w:o.w,h:o.h,fe:o.framesEnc}))};
  return out;
};
export default async ({ page }) => {
  await page.evaluate(DOM);
  const which = process.env.QA_TOGGLE || 'mic';
  const re = which==='mic' ? /^(Mute|Unmute)$/i : /^Turn camera (on|off)$/i;
  const out={which};
  out.before = await read(page);
  await page.waitForTimeout(2500);
  out.before2 = await read(page);
  out.click = await page.evaluate((src)=>window.__qa.clickDeepest(new RegExp(src,'i')), re.source);
  await page.waitForTimeout(2500);
  out.after = await read(page);
  await page.waitForTimeout(3000);
  out.after2 = await read(page);
  out.notices = await page.evaluate(()=>window.__qa.notices());
  return out;
};
