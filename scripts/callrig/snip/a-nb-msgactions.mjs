import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const needle = process.env.QA_MSG || 'THREADPROBE-41';
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2200); }
  const out = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    const cands=[...p.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(n))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const msg=cands[0]; if(!msg) return {err:'message not found'};
    // hover to reveal actions
    msg.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));
    msg.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true}));
    return {ok:true, txt:(msg.innerText||'').replace(/\s+/g,' ').slice(0,90)}; }, [needle, VIS]);
  if (out.err) return out;
  await page.waitForTimeout(1500);
  out.actions = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const row=[...p.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(n))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    let anc=row; const seen=new Set(); const btns=[];
    for(let i=0;i<5 && anc;i++){ for(const b of anc.querySelectorAll('button')){ if(!vis(b)) continue;
        const l=(b.getAttribute('aria-label')||b.innerText||'').trim(); if(l && !seen.has(l)){seen.add(l); btns.push(l);} }
      anc=anc.parentElement; }
    return btns.slice(0,16); }, [needle, VIS]);
  return out;
}
