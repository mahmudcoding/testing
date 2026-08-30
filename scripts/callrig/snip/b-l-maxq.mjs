/* sector L: Maximum video quality — does changing it cap what participants publish? */
import { DOM } from './lib.mjs';
import { second } from './b-second.mjs';
const RES = `async () => {
  let out=null;
  for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    const st=await pc.getStats(); const v=[];
    st.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video') v.push({w:r.frameWidth,h:r.frameHeight,fps:r.framesPerSecond,fe:r.framesEncoded,rid:r.rid,ssrc:r.ssrc}); });
    out=v; break; }
  return {out, camBtn:(()=>{const b=[...document.querySelectorAll('button')].filter(window.__qa.vis)
    .find(x=>/^Turn camera (on|off)$/i.test(window.__qa.nameOf(x).trim())); return b?window.__qa.nameOf(b).trim():null;})()};
}`;
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const out={};
  // open settings if not open
  const open = await page.evaluate(()=>!!document.querySelector('[data-testid="meeting-settings-panel"]'));
  if(!open){ await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); b&&b.click();});
    await page.waitForTimeout(2800); await page.evaluate(DOM); }
  out.section = await page.evaluate(()=>{
    const q=window.__qa;
    const s=document.querySelector('[data-testid="meeting-settings-video-quality-section"]');
    const sl=document.querySelector('[data-testid="meeting-settings-video-quality-slider"]');
    const val=document.querySelector('[data-testid="meeting-settings-video-quality-value"]');
    return {sectionText:s?(s.innerText||'').replace(/\s+/g,' ').trim().slice(0,300):null,
      slider: sl?{tag:sl.tagName, type:sl.type, value:sl.value, min:sl.min, max:sl.max, step:sl.step,
        role:sl.getAttribute('role'), vnow:sl.getAttribute('aria-valuenow'), vmin:sl.getAttribute('aria-valuemin'),
        vmax:sl.getAttribute('aria-valuemax'), vtext:sl.getAttribute('aria-valuetext'),
        aria:q.nameOf(sl).slice(0,60), vis:q.vis(sl), disabled:sl.disabled}:null,
      valueText: val?(val.innerText||'').trim():null};
  });
  const bob = await second('B','bob');
  const carol = await second('B','carol');
  await bob.page.evaluate(DOM); await carol.page.evaluate(DOM);
  out.before = {alice: await page.evaluate(`(${RES})()`), bob: await bob.page.evaluate(`(${RES})()`), carol: await carol.page.evaluate(`(${RES})()`)};
  // set the slider to its minimum
  out.set = await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="meeting-settings-video-quality-slider"]');
    if(!s) return {ok:false};
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(s, s.min); s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true}));
    return {ok:true, now:s.value};
  });
  await page.waitForTimeout(1200);
  out.afterSet = await page.evaluate(()=>{
    const val=document.querySelector('[data-testid="meeting-settings-video-quality-value"]');
    const save=document.querySelector('[data-testid="meeting-settings-save"]');
    return {valueText: val?(val.innerText||'').trim():null, saveDisabled: save?save.disabled:null};
  });
  out.save = await page.evaluate(()=>{const b=document.querySelector('[data-testid="meeting-settings-save"]'); if(!b) return {ok:false}; b.click(); return {ok:true};});
  await page.waitForTimeout(3000);
  out.apiAfterSave = await page.evaluate(async ()=>{
    const id=(location.pathname.match(/\/call\/([^/?]+)/)||[])[1];
    const r=await fetch(`/api/v1/meeting/${id}/settings`,{credentials:'include'});
    const j=await r.json().catch(()=>null);
    return {status:r.status, max_video_height:j&&j.max_video_height};
  });
  out.samples=[];
  for(let i=0;i<8;i++){
    await page.waitForTimeout(5000);
    out.samples.push({i, alice: await page.evaluate(`(${RES})()`), bob: await bob.page.evaluate(`(${RES})()`), carol: await carol.page.evaluate(`(${RES})()`)});
  }
  await bob.browser.close(); await carol.browser.close();
  return out;
};
