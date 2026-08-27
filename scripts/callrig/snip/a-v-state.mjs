// Verify pass: what is on this screen right now — visible interactive nodes, dialogs, prompts.
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}if(op<=0.05)return false;const cx=r.left+r.width/2,cy=r.top+r.height/2;if(cx<0||cy<0||cx>innerWidth||cy>innerHeight)return false;const h=document.elementFromPoint(cx,cy);return !!h&&(el.contains(h)||h.contains(el));}`;
export default async ({ page }) => {
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const root=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {
      url: location.pathname,
      visibility: document.visibilityState,
      header: (root.innerText||'').replace(/\n+/g,' | ').slice(0,220),
      dialogs: [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
        .map(d=>(d.getAttribute('data-testid')||'?')+':'+(d.innerText||'').replace(/\s+/g,' ').slice(0,120)),
      buttons: [...root.querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,26))+(b.getAttribute('data-testid')?' {'+b.getAttribute('data-testid')+'}':''))
        .filter(Boolean).slice(0,45),
    };},VS);
};
