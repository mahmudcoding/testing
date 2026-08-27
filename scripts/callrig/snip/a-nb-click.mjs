import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const lbl = process.env.QA_CLICK;
  const out = {};
  out.click = await page.evaluate(([l,v])=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button,[role="menuitem"],a,[role="tab"]')].filter(vis)
      .find(x=>new RegExp('^'+l+'$','i').test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if(!b) return {err:'not found', have:[...document.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim().replace(/\s+/g,' ').slice(0,34)).slice(0,40)};
    b.click(); return {ok:true, label:(b.getAttribute('aria-label')||b.innerText||'').trim()}; }, [lbl, VIS]);
  await page.waitForTimeout(Number(process.env.QA_WAIT||3500));
  out.dlg = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(x=>[...x.querySelectorAll('button')].filter(vis).length<=8).pop();
    return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,240), btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30),t:b.getAttribute('data-testid')}))}:null; }, VIS);
  out.panel = await page.evaluate(()=>{ const p=document.querySelector('[data-testid="call-side-panel-slot"]'); return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,260):null; });
  return out;
}
