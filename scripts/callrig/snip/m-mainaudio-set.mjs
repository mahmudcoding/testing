import { DOM } from './lib.mjs';
// QA_ACT=mute|slider QA_VAL=0..100
export default async ({page}) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const readEls = () => page.evaluate(async ()=>{
    const pcs=window.__pcs||[]; const map={};
    for(let i=0;i<pcs.length;i++){ for(const r of pcs[i].getReceivers()){ if(r.track) map[r.track.id]=i; } }
    return [...document.querySelectorAll('audio')].map(e=>({vol:e.volume, muted:e.muted, paused:e.paused,
      pcs:[...new Set((e.srcObject&&e.srcObject.getTracks?e.srcObject.getTracks():[]).map(t=>map[t.id]))]}));
  });
  const out = {before: await readEls()};
  const b = await page.$('[data-testid="main-audio-trigger"]');
  if (!b) return {...out, err:'no trigger'};
  const bb = await b.boundingBox(); await page.mouse.click(bb.x+bb.width/2, bb.y+bb.height/2);
  await page.waitForTimeout(1400);
  if ((process.env.QA_ACT||'mute') === 'mute') {
    const m = await page.$('[data-testid="main-audio-mute"]');
    out.muteFound = !!m;
    if (m) { const mb = await m.boundingBox(); await page.mouse.click(mb.x+mb.width/2, mb.y+mb.height/2); await page.waitForTimeout(1800); }
  } else {
    const s = await page.$('[data-testid="main-audio-slider"]');
    out.sliderFound = !!s;
    if (s) { const sb = await s.boundingBox(); const v = Number(process.env.QA_VAL||0);
      await page.mouse.click(sb.x + sb.width * (v/100), sb.y + sb.height/2); await page.waitForTimeout(1800); }
  }
  out.trigger = await page.evaluate(()=>{const e=document.querySelector('[data-testid="main-audio-trigger"]');
    return e?(e.getAttribute('aria-label')||e.textContent||'').trim():null;});
  out.popText = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const c=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper]')].filter(vis);
    const m=c[c.length-1]; return m?(m.innerText||'').replace(/\s+/g,' ').trim().slice(0,200):null;});
  out.after = await readEls();
  return out;
};
