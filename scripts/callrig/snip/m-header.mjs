import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    // top strip of the call overlay
    const all=[...document.querySelectorAll('button,[role=slider],input[type=range],[role=switch]')].filter(vis)
      .filter(e=>{const r=e.getBoundingClientRect(); return r.y < 120;});
    return all.map(e=>{const r=e.getBoundingClientRect();
      return {tag:e.tagName, role:e.getAttribute('role'), l:(e.getAttribute('aria-label')||T(e)||'').slice(0,50),
        t:e.getAttribute('data-testid'), title:e.getAttribute('title'),
        val:e.getAttribute('aria-valuenow')||e.value, box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};});
  });
};
