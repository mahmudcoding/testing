import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const want = process.env.QA_DEVICE || 'Fake Audio Input 1';
  const r = await page.evaluate(([w,v])=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded')
      .filter(m=>/MICROPHONE|SPEAKER|CAMERA/.test(m.innerText||''));
    const m=ms[ms.length-1]; if(!m) return {err:'no device menu'};
    const b=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis)
      .find(x=>(x.innerText||'').startsWith(w));
    if(!b) return {err:'no device '+w, have:[...m.querySelectorAll('button')].filter(vis).map(x=>(x.innerText||'').split('\n')[0])};
    b.click(); return {ok:true, picked:(b.innerText||'').split('\n')[0]}; }, [want, VIS]);
  await page.waitForTimeout(6000);
  return r;
}
