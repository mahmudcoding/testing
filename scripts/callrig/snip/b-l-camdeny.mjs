/* sector L: camera permission denied — what is the user told when they press Turn camera on? */
import { DOM } from './lib.mjs';
const st = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const g=t=>{const n=document.querySelector('[data-testid="'+t+'"]'); return n?{vis:q.boxVis(n), text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,220)}:null;};
  const cam=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim()));
  const se=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    for(const t of pc.getSenders()) if(t.track) se.push(t.track.kind+':'+t.track.enabled); }
  return {cam:cam?{n:q.nameOf(cam).trim(), p:cam.getAttribute('aria-pressed'), d:cam.disabled}:null,
    mediaErr:g('call-media-error-banner'), lifeErr:g('call-lifecycle-error-banner'),
    devicePrompt:g('device-request-prompt'),
    notices:q.notices().filter(n=>n.w>40&&n.h>16).map(n=>n.text.slice(0,140)),
    senders:se, gum:(window.__gumCalls||[]).length,
    surfaceTail:(document.querySelector('[data-testid="call-surface"]')||document.body).innerText.replace(/\s+/g,' ').trim().slice(0,260)};
});
export default async ({ page, ctx }) => {
  await page.evaluate(DOM);
  const cdp = await ctx.newCDPSession(page);
  const out={};
  out.origin = await page.evaluate(()=>location.origin);
  // deny camera at the browser level, as a user who clicked Block would
  out.setPerm = await cdp.send('Browser.setPermission', {
    origin: out.origin,
    permission: {name:'camera'},
    setting: 'denied'
  }).then(()=>'ok').catch(e=>String(e).slice(0,120));
  out.a_before = await st(page);
  // ensure the camera is currently off
  if(out.a_before.cam && out.a_before.cam.n === 'Turn camera off'){
    await page.evaluate(()=>window.__qa.clickDeepest(/^Turn camera off$/i));
    await page.waitForTimeout(2500);
  }
  out.b_off = await st(page);
  // poll from BEFORE the click
  const poll=[]; const t0=Date.now();
  const sample = async (tag) => poll.push({dt:Date.now()-t0, tag, ...(await st(page))});
  await sample('pre'); await page.waitForTimeout(400); await sample('pre');
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Turn camera on$/i));
  for(let i=0;i<26;i++){ await page.waitForTimeout(500); await sample('post'); }
  out.poll=poll;
  // restore permission
  out.restore = await cdp.send('Browser.setPermission', {origin: out.origin,
    permission:{name:'camera'}, setting:'granted'}).then(()=>'ok').catch(e=>String(e).slice(0,80));
  return out;
};
