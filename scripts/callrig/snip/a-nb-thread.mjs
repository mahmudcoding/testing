import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const needle = process.env.QA_MSG || 'THREADPROBE-41';
  const reply = process.env.QA_REPLY || 'THREADREPLY-42';
  const out = {};
  out.open = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const row=[...p.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(n))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!row) return {err:'no message'};
    row.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));
    let anc=row, btn=null;
    for(let i=0;i<5 && anc && !btn;i++){ btn=[...anc.querySelectorAll('button')].filter(vis)
        .find(b=>/^Thread$/i.test((b.getAttribute('aria-label')||b.innerText||'').trim())); anc=anc.parentElement; }
    if(!btn) return {err:'no Thread button'};
    btn.click(); return {ok:true}; }, [needle, VIS]);
  if (out.open.err) return out;
  await page.waitForTimeout(3000);
  out.panelAfterOpen = await page.evaluate((v)=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {dialog: ds.length? (ds[ds.length-1].innerText||'').replace(/\s+/g,' ').slice(0,220):null,
            panel: p?(p.innerText||'').replace(/\s+/g,' ').slice(0,220):null}; }, VIS);
  // type the reply into whatever composer is now focused/visible
  const ed = await page.evaluate((v)=>{ const vis=eval(v);
    const eds=[...document.querySelectorAll('[contenteditable="true"],textarea')].filter(vis);
    if(!eds.length) return {n:0};
    const e=eds[eds.length-1]; e.focus();
    return {n:eds.length, label:e.getAttribute('aria-label')||e.placeholder||null}; }, VIS);
  out.composer = ed;
  if (ed.n) {
    await page.keyboard.type(reply, {delay:15});
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3500);
  }
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {dialog: ds.length? (ds[ds.length-1].innerText||'').replace(/\s+/g,' ').slice(0,260):null,
            panel: p?(p.innerText||'').replace(/\s+/g,' ').slice(0,260):null}; }, VIS);
  return out;
}
