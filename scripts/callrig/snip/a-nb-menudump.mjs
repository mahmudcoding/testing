import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Dave';
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2000); }
  await page.evaluate(([name,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const row=[...p.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(name))
      .filter(e=>[...e.querySelectorAll('button')].some(b=>/Participant actions/i.test(b.getAttribute('aria-label')||'')))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    row.querySelector('button[aria-label*="Participant actions"]').click(); }, [who, VIS]);
  await page.waitForTimeout(2500);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="listbox"],[role="dialog"]')]
      .filter(vis).filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded')
      .filter(m=>{const n=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).length; return n>0&&n<=20;});
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    const r=m.getBoundingClientRect();
    return {
      overflow:{scrollH:m.scrollHeight, clientH:m.clientHeight, scrollW:m.scrollWidth, clientW:m.clientWidth,
                rect:`${Math.round(r.width)}x${Math.round(r.height)}`, css:getComputedStyle(m).overflowY},
      allDescendantsWithText:[...m.querySelectorAll('*')].filter(e=>!e.childElementCount)
        .map(e=>(e.textContent||'').trim()).filter(t=>t).slice(0,30),
      fullText:(m.innerText||'').replace(/\s+/g,' | '),
      items:[...m.querySelectorAll('[role="menuitem"],button,[role="menuitemradio"],[role="menuitemcheckbox"]')].filter(vis)
        .map(i=>({l:(i.getAttribute('aria-label')||i.innerText||'').trim().replace(/\s+/g,' '),
                  role:i.getAttribute('role'), expanded:i.getAttribute('aria-haspopup')||i.getAttribute('aria-expanded')||null})),
      html:(m.innerHTML||'').replace(/\s+/g,' ').slice(0,300)
    }; }, VIS);
}
