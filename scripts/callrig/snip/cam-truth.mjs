import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const me = await page.evaluate(async()=> (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email);
  const a = await page.evaluate('('+RTC_STATS+')()');
  await page.waitForTimeout(7000);
  const b = await page.evaluate('('+RTC_STATS+')()');
  const outV = s => s.stats.flatMap(pc=>pc.out.filter(o=>o.kind==='video')).map(o=>({wh:`${o.w}x${o.h}`, bytes:o.bytes, enc:o.framesEnc}));
  const local = await page.evaluate(()=>{
    const tb=document.querySelector('[data-testid="call-toolbar"]');
    const camBtn=[...tb.querySelectorAll('button')].find(x=>/camera/i.test(x.getAttribute('aria-label')||''));
    const senders = (window.__pcs||[]).flatMap(pc=>pc.getSenders? pc.getSenders().filter(s=>s.track&&s.track.kind==='video').map(s=>({id:s.track.id.slice(0,8), enabled:s.track.enabled, state:s.track.readyState, label:s.track.label.slice(0,40), settings: s.track.getSettings? JSON.stringify(s.track.getSettings()).slice(0,140):null})):[]);
    return {camLabel: camBtn? camBtn.getAttribute('aria-label'):null, gum:(window.__gumCalls||[]).length,
            gumArgs:(window.__gumCalls||[]).slice(-2).map(x=>x.c.slice(0,120)), senders,
            localVideoEls: [...document.querySelectorAll('video')].filter(v=>v.muted).map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused}))};
  });
  const A=outV(a),B=outV(b);
  return {me, outVideoBefore:A, outVideoAfter:B, dFrames: B.map((x,i)=>x.enc-(A[i]?A[i].enc:0)), dBytes: B.map((x,i)=>x.bytes-(A[i]?A[i].bytes:0)), local};
};
