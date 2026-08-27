import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const needle = process.env.QA_TEXT || 'Night Room';
  return await page.evaluate(([n,v])=>{ const vis=eval(v);
    const els=[...document.querySelectorAll('*')].filter(e=>!e.childElementCount).filter(vis)
      .filter(e=>(e.textContent||'').includes(n));
    return els.map(e=>{const s=getComputedStyle(e);
      return {txt:(e.textContent||'').trim().slice(0,44), sw:e.scrollWidth, cw:e.clientWidth,
        overflow:s.overflow, textOverflow:s.textOverflow, whiteSpace:s.whiteSpace,
        title:e.getAttribute('title'), cls:String(e.className||'').slice(0,40)};}).slice(0,4); }, [needle, VIS]);
};
