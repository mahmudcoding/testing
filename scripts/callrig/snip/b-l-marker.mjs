/* sector L: the raw marker in the diagnostics panel header — is it really on screen? */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  // get back into the call and open the panel
  const hasPip = await page.evaluate(()=>!!document.querySelector('[data-testid="draggable-pip"]'));
  if(hasPip){
    await page.evaluate(()=>{const q=window.__qa;
      const p=document.querySelector('[data-testid="draggable-pip"]');
      const b=[...p.querySelectorAll('button')].find(x=>/^Expand$/i.test(q.nameOf(x).trim())); b&&b.click();});
    await page.waitForTimeout(3000);
    await page.evaluate(DOM);
  }
  out.pressed0 = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]'); return b?b.getAttribute('aria-pressed'):null;});
  if(out.pressed0!=='true'){
    await page.evaluate(()=>document.querySelector('[data-testid="call-nerd-stats-toggle"]').click());
    await page.waitForTimeout(2500);
  }
  out.marker = await page.evaluate(()=>{
    const q=window.__qa;
    const NEEDLE='__ALOQA_CALL_DEBUG_MARKER__';
    const leaves=[...document.querySelectorAll('*')].filter(n=>n.children.length===0 && (n.textContent||'').includes(NEEDLE));
    return {
      leafCount: leaves.length,
      leaves: leaves.map(n=>{const r=n.getBoundingClientRect(); const cs=getComputedStyle(n);
        return {tag:n.tagName, cls:(n.className||'').toString().slice(0,60),
          textContent:(n.textContent||'').trim(), innerText:(n.innerText||'').trim(),
          boxVis:q.boxVis(n), hitVis:q.vis(n), opacity:q.opacity(n),
          w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.left), y:Math.round(r.top),
          fontSize:cs.fontSize, color:cs.color, transform:cs.textTransform};}),
      headerInnerText: (()=>{const h=document.querySelector('[data-testid="call-debug-panel-header"]');
        return h?(h.innerText||'').replace(/\s+/g,' ').trim():null;})(),
      headerHtml: (()=>{const h=document.querySelector('[data-testid="call-debug-panel-header"]');
        return h?h.innerHTML.replace(/\s+/g,' ').slice(0,700):null;})(),
      bodyHasMarker: (document.body.innerText||'').includes(NEEDLE)
    };
  });
  // what does Copy snapshot produce?
  out.copy = await page.evaluate(async ()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Copy snapshot$/i.test(q.nameOf(x).trim()));
    if(!b) return {ok:false};
    let captured=null;
    const orig = navigator.clipboard && navigator.clipboard.writeText;
    if(orig) navigator.clipboard.writeText = async (t)=>{ captured=t; return orig.call(navigator.clipboard, t).catch(()=>{}); };
    b.click();
    await new Promise(r=>setTimeout(r,1200));
    if(orig) navigator.clipboard.writeText = orig;
    return {ok:true, len: captured?captured.length:null,
      hasMarker: captured?captured.includes('__ALOQA_CALL_DEBUG_MARKER__'):null,
      head: captured?captured.slice(0,300):null};
  });
  return out;
};
