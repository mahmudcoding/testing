import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  return await page.evaluate(async () => {
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    let me=null; try{me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();}catch(e){}
    const btns=[...document.querySelectorAll('button')].filter(vis).map(b=>({
      l:(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,45),
      t:b.getAttribute('title'), p:b.getAttribute('aria-pressed'),
      d:b.disabled||b.getAttribute('aria-disabled')==='true'})).filter(b=>b.l);
    return {who: me && me.email, url: location.pathname, vis: document.visibilityState, buttons: btns};
  });
};
