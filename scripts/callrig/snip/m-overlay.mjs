import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  return await page.evaluate(async ()=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const root=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    let me=null; try{me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();}catch(e){}
    return {who: me&&me.email, url: location.pathname, vis: document.visibilityState,
      text: (root.innerText||'').replace(/\s+/g,' ').trim(),
      buttons: [...root.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean)};
  });
};
