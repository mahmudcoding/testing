import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const needle = process.env.QA_MSG;
  const em = process.env.QA_EMOJI || '👍';
  const out={};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2200); }
  out.open = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const row=[...p.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(n))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!row) return {err:'no message'};
    row.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));
    let anc=row, btn=null;
    for(let i=0;i<5 && anc && !btn;i++){ btn=[...anc.querySelectorAll('button')].filter(vis)
      .find(b=>/^React$/i.test((b.getAttribute('aria-label')||b.innerText||'').trim())); anc=anc.parentElement; }
    if(!btn) return {err:'no React button'};
    btn.click(); return {ok:true}; }, [needle, VIS]);
  if (out.open.err) return out;
  await page.waitForTimeout(2500);
  out.pick = await page.evaluate(([e,v])=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1]; if(!m) return {err:'no picker'};
    const b=[...m.querySelectorAll('button')].filter(vis).find(x=>(x.textContent||'').trim()===e);
    if(!b) return {err:'no emoji', have:[...m.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim()).slice(0,10)};
    b.click(); return {ok:true}; }, [em, VIS]);
  await page.waitForTimeout(3500);
  out.after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return (p?.innerText||'').replace(/\s+/g,' ').slice(-160);});
  return out;
};
