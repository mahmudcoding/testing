/* sector L: does the snapshot carry a build id, and does Settings > About show a real version? */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.snapshotFields = await page.evaluate(async ()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Copy snapshot$/i.test(q.nameOf(x).trim()));
    if(!b) return {ok:false};
    let cap=null;
    const orig=navigator.clipboard.writeText;
    navigator.clipboard.writeText=async t=>{cap=t; return orig.call(navigator.clipboard,t).catch(()=>{});};
    b.click(); await new Promise(r=>setTimeout(r,1500));
    navigator.clipboard.writeText=orig;
    if(!cap) return {ok:false};
    let j=null; try{ j=JSON.parse(cap);}catch(e){}
    const flat={}; const walk=(o,p)=>{ if(o&&typeof o==='object'&&!Array.isArray(o)){ for(const k of Object.keys(o)){
      const v=o[k]; if(v&&typeof v==='object') { if(p.split('.').length<3) walk(v,p?p+'.'+k:k); }
      else flat[(p?p+'.':'')+k]=String(v).slice(0,60); } } };
    if(j) walk(j,'');
    return {ok:true, topKeys:j?Object.keys(j):null,
      versionish:Object.entries(flat).filter(([k])=>/ver|build|sha|commit|release|env|branch|dpl/i.test(k)),
      clientBlock: j&&j.client?JSON.stringify(j.client).slice(0,400):null};
  });
  return out;
};
