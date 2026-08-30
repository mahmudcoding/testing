/* sector L: is the Maximum video quality slider operable from the keyboard? */
import { DOM } from './lib.mjs';
const read = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const s=document.querySelector('[data-testid="meeting-settings-video-quality-slider"]');
  const v=document.querySelector('[data-testid="meeting-settings-video-quality-value"]');
  const ae=document.activeElement;
  return {value:s?s.value:null, valueText:v?(v.innerText||'').trim():null,
    ariaValueText:s?s.getAttribute('aria-valuetext'):null,
    focused: s?document.activeElement===s:null,
    active: ae?{tag:ae.tagName, name:q.nameOf(ae).replace(/\s+/g,' ').trim().slice(0,45), testid:ae.getAttribute('data-testid')||null}:null,
    sliderVis: s?{boxVis:q.boxVis(s), hitVis:q.vis(s), opacity:q.opacity(s),
      rect:(r=>({w:Math.round(r.width),h:Math.round(r.height)}))(s.getBoundingClientRect()),
      tabIndex:s.tabIndex}:null};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  const open = await page.evaluate(()=>!!document.querySelector('[data-testid="meeting-settings-panel"]'));
  if(!open){ await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); b&&b.click();});
    await page.waitForTimeout(2800); await page.evaluate(DOM); }
  out.a = await read(page);
  // focus it the way a keyboard user would reach it: focus() then arrows
  out.focus = await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="meeting-settings-video-quality-slider"]');
    if(!s) return {ok:false}; s.focus(); return {ok:true, focused:document.activeElement===s};
  });
  out.b_focused = await read(page);
  const steps=[];
  for(const k of ['ArrowRight','ArrowRight','ArrowRight','ArrowLeft']){
    await page.keyboard.press(k); await page.waitForTimeout(700);
    steps.push({key:k, ...(await read(page))});
  }
  out.keySteps = steps.map(s=>({key:s.key, value:s.value, valueText:s.valueText, focused:s.focused}));
  // and reach it purely by Tab from the panel top, as a keyboard user actually would
  out.tabReach = await (async()=>{
    await page.evaluate(()=>{const p=document.querySelector('[data-testid="meeting-settings-panel"]');
      const f=p?p.querySelector('button,input,[tabindex]'):null; f&&f.focus();});
    const seen=[];
    for(let i=0;i<25;i++){
      await page.keyboard.press('Tab'); await page.waitForTimeout(150);
      const r=await page.evaluate(()=>{const q=window.__qa; const ae=document.activeElement;
        return {tag:ae.tagName, testid:ae.getAttribute('data-testid')||null, name:q.nameOf(ae).replace(/\s+/g,' ').trim().slice(0,40)};});
      seen.push(r);
      if(r.testid==='meeting-settings-video-quality-slider') return {reached:true, atTab:i, path:seen.map(x=>x.testid||x.name).slice(0,25)};
    }
    return {reached:false, path:seen.map(x=>x.testid||x.name)};
  })();
  // restore to 1080p
  await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="meeting-settings-video-quality-slider"]');
    if(!s) return;
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(s,'3'); s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.waitForTimeout(2500);
  out.restored = await page.evaluate(async ()=>{
    const id=(location.pathname.match(/\/call\/([^/?]+)/)||[])[1];
    const r=await fetch(`/api/v1/meeting/${id}/settings`,{credentials:'include'});
    const j=await r.json().catch(()=>null);
    return {max_video_height:j&&j.max_video_height};
  });
  return out;
};
