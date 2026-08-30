/* sector L: capture whatever prompt is on the call stage right now, in full */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa;
    const btn=[...document.querySelectorAll('button')].find(b=>/^(Not now|Turn off my camera)$/i.test(q.nameOf(b).trim()));
    if(!btn) return {found:false,
      allButtons:[...document.querySelectorAll('button')].map(b=>q.nameOf(b).trim().slice(0,40)),
      qualityPrompt: !!document.querySelector('[data-testid="call-quality-prompt"]')};
    // smallest ancestor that contains both buttons
    let n=btn, host=null;
    for(let i=0;i<10&&n;i++,n=n.parentElement){
      const t=(n.innerText||'');
      if(/Not now/i.test(t)&&/Turn off my camera/i.test(t)){ host=n; break; }
    }
    const qp=document.querySelector('[data-testid="call-quality-prompt"]');
    const meter=document.querySelector('[data-testid="call-quality-signal-meter"]');
    return {found:true,
      hostTestid: host?host.getAttribute('data-testid'):null,
      hostText: host?(host.innerText||'').replace(/\s+/g,' ').trim().slice(0,400):null,
      hostVis: host?q.boxVis(host):null,
      hostOpacity: host?q.opacity(host):null,
      hostRect: host?(r=>({w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.left),y:Math.round(r.top)}))(host.getBoundingClientRect()):null,
      btnVis: q.vis(btn), btnName:q.nameOf(btn).trim(),
      qualityPrompt: qp?{vis:q.boxVis(qp), hit:q.vis(qp), opacity:q.opacity(qp),
        text:(qp.innerText||'').replace(/\s+/g,' ').trim().slice(0,400),
        rect:(r=>({w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.left),y:Math.round(r.top)}))(qp.getBoundingClientRect()),
        html:qp.outerHTML.replace(/\s+/g,' ').slice(0,500)}:null,
      meter: meter?{bars:meter.getAttribute('data-remaining-bars'), aria:meter.getAttribute('aria-label'),
        vis:q.boxVis(meter), opacity:q.opacity(meter)}:null,
      applied:[...document.querySelectorAll('[data-testid="call-quality-applied"]')].map(n=>({
        a:n.getAttribute('data-action'), t:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,120), vis:q.boxVis(n)})),
      surfaceText:(document.querySelector('[data-testid="call-surface"]')||document.body).innerText.replace(/\s+/g,' ').trim().slice(0,400)};
  });
};
