/* sector L: push to talk — with a positive control that the Space key reaches the page */
import { DOM } from './lib.mjs';
const mic = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^(Mute|Unmute)$/i.test(q.nameOf(x).trim()));
  const s=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    for(const t of pc.getSenders()) if(t.track&&t.track.kind==='audio') s.push({en:t.track.enabled}); }
  return {label:b?q.nameOf(b).trim():null, senders:s, active:document.activeElement?
    (document.activeElement.tagName+'/'+(document.activeElement.getAttribute('aria-label')||'').slice(0,25)):null};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  // instrument: record every keydown/keyup seen at window and document level
  await page.evaluate(()=>{
    window.__keys=[];
    if(!window.__keyhook){ window.__keyhook=1;
      window.addEventListener('keydown', e=>window.__keys.push({p:'win-cap-down',k:e.code,r:e.repeat,t:Date.now(),tgt:e.target&&e.target.tagName}), true);
      window.addEventListener('keyup',   e=>window.__keys.push({p:'win-cap-up',k:e.code,t:Date.now(),tgt:e.target&&e.target.tagName}), true);
      document.addEventListener('keydown', e=>window.__keys.push({p:'doc-bub-down',k:e.code,r:e.repeat,t:Date.now()}));
      document.addEventListener('keyup',   e=>window.__keys.push({p:'doc-bub-up',k:e.code,t:Date.now()}));
    }
  });
  out.pttState = await page.evaluate(()=>{
    // read the persisted PTT preference if it is anywhere obvious
    try{ return Object.keys(localStorage).filter(k=>/talk|ptt|audio|call/i.test(k))
      .map(k=>({k, v:String(localStorage.getItem(k)).slice(0,160)})); }catch(e){ return String(e); }
  });
  out.before = await mic(page);
  // click on an empty part of the call stage so focus is inside the call, then hold Space
  out.stageClick = await page.evaluate(()=>{
    const t=document.querySelector('[data-testid="call-surface"]');
    if(!t) return {ok:false};
    const r=t.getBoundingClientRect();
    const el=document.elementFromPoint(r.left+r.width/2, r.top+30);
    if(el) el.click();
    return {ok:true, hit:el?el.tagName+'.'+(el.className||'').toString().slice(0,30):null};
  });
  await page.waitForTimeout(600);
  await page.keyboard.down('Space');
  await page.waitForTimeout(1500);
  out.holding = await mic(page);
  await page.keyboard.up('Space');
  await page.waitForTimeout(1200);
  out.released = await mic(page);
  out.keys = await page.evaluate(()=>window.__keys.slice(0,20));
  // second attempt: dispatch on window explicitly, in case Playwright's target differs
  await page.evaluate(()=>{ window.__keys=[];
    window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}));
    document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true})); });
  await page.waitForTimeout(1500);
  out.afterSynthetic = await mic(page);
  await page.evaluate(()=>{ window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' ',bubbles:true}));
    document.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' ',bubbles:true})); });
  await page.waitForTimeout(800);
  out.afterSyntheticUp = await mic(page);
  return out;
};
