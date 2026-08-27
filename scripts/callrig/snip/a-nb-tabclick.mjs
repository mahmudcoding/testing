import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const label = process.env.QA_TAB || 'Members';
  const clicked = await page.evaluate(([l,v])=>{ const vis=eval(v);
    const els=[...document.querySelectorAll('button,[role="tab"],a,li')].filter(vis)
      .filter(e=>new RegExp('^'+l,'i').test((e.getAttribute('aria-label')||e.textContent||'').trim()));
    if(!els.length) return {err:'not found'};
    els[0].click(); return {ok:true, l:(els[0].textContent||'').trim().slice(0,30)}; }, [label, VIS]);
  await page.waitForTimeout(3000);
  const state = await page.evaluate((v)=>{ const vis=eval(v);
    const a=[...document.querySelectorAll('aside')].filter(vis).pop();
    return {txt:a?(a.innerText||'').replace(/\s+/g,' ').slice(0,300):null,
      btns:a?[...a.querySelectorAll('button')].filter(vis)
        .map(b=>((b.getAttribute('data-testid')||'')+'|'+(b.getAttribute('aria-label')||b.textContent||'').trim()).slice(0,46)).slice(0,25):[]};}, VIS);
  return {clicked, state};
};
