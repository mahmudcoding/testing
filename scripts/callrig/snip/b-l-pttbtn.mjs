/* sector L: with Push to talk ON, does the Mute/Unmute button do anything?
   Polls from BEFORE the click at 150ms so a momentary unmute cannot hide. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();});

  // 1. confirm PTT is on, and read the button's own state
  await page.evaluate(()=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim())); b&&b.click();});
  await page.waitForTimeout(1400);
  out.ptt = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return null;
    const s=[...w.querySelectorAll('[role=switch]')].find(n=>/Push to talk/i.test(q.nameOf(n)));
    return s?{checked:s.getAttribute('aria-checked')}:null;
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  await page.evaluate(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();});

  out.btn = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^(Mute|Unmute)$/i.test(q.nameOf(x).trim()));
    if(!b) return null;
    const cs=getComputedStyle(b);
    return {name:q.nameOf(b).trim(), pressed:b.getAttribute('aria-pressed'),
      disabled:b.disabled, ariaDisabled:b.getAttribute('aria-disabled'),
      title:b.getAttribute('title'), cursor:cs.cursor, pe:cs.pointerEvents, opacity:cs.opacity,
      cls:(b.className||'').toString().slice(0,120)};
  });

  // 2. poll from before the click
  const poll = [];
  const t0=Date.now();
  const sample = async (tag) => {
    const s = await page.evaluate(()=>{
      const q=window.__qa;
      const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^(Mute|Unmute)$/i.test(q.nameOf(x).trim()));
      const se=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
        for(const t of pc.getSenders()) if(t.track&&t.track.kind==='audio') se.push(t.track.enabled); }
      return {l:b?q.nameOf(b).trim():null, p:b?b.getAttribute('aria-pressed'):null, en:se[0], n:q.notices().map(x=>x.text).slice(0,3)};
    });
    poll.push({dt:Date.now()-t0, tag, ...s});
  };
  for(let i=0;i<3;i++){ await sample('pre'); await page.waitForTimeout(150); }
  out.click = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^(Mute|Unmute)$/i.test(q.nameOf(x).trim()));
    if(!b) return {ok:false};
    const r=b.getBoundingClientRect();
    const top=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
    b.click();
    return {ok:true, name:q.nameOf(b).trim(), topmost: top?(top===b||b.contains(top)||top.contains(b)):false};
  });
  for(let i=0;i<20;i++){ await page.waitForTimeout(150); await sample('post'); }
  out.poll = poll;
  // 3. control: turn PTT off, then the same click
  await page.evaluate(()=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim())); b&&b.click();});
  await page.waitForTimeout(1400);
  out.pttOff = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    const s=w?[...w.querySelectorAll('[role=switch]')].find(n=>/Push to talk/i.test(q.nameOf(n))):null;
    if(!s) return {ok:false}; const before=s.getAttribute('aria-checked'); s.click(); return {ok:true, before};
  });
  await page.waitForTimeout(1200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  await page.evaluate(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();});
  out.controlBefore = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^(Mute|Unmute)$/i.test(q.nameOf(x).trim()));
    return b?q.nameOf(b).trim():null;
  });
  await page.evaluate(()=>window.__qa.clickDeepest(/^(Mute|Unmute)$/i));
  await page.waitForTimeout(1500);
  out.controlAfter = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^(Mute|Unmute)$/i.test(q.nameOf(x).trim()));
    const se=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
      for(const t of pc.getSenders()) if(t.track&&t.track.kind==='audio') se.push(t.track.enabled); }
    return {label:b?q.nameOf(b).trim():null, en:se[0]};
  });
  return out;
};
