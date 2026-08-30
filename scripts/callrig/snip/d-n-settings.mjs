export default async ({page}) => {
  const out={};
  const t = page.locator('[data-testid="call-controls-settings-toggle"]');
  out.found = await t.count();
  if(!out.found) return out;
  if (await t.first().getAttribute('aria-pressed')!=='true'){ await t.first().click(); await page.waitForTimeout(2500); }
  out.pressed = await t.first().getAttribute('aria-pressed');
  out.panel = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p = document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return null;
    return {text:(p.innerText||'').replace(/\s+/g,' '),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' '),tid:b.dataset.testid||null,st:b.getAttribute('aria-checked')||b.getAttribute('aria-pressed')||b.getAttribute('data-state')||null,dis:b.disabled||b.getAttribute('aria-disabled')})),
      switches:[...p.querySelectorAll('[role=switch],[role=radio],[role=checkbox],input')].filter(vis).map(e=>({r:e.getAttribute('role')||e.type,ck:e.checked??e.getAttribute('aria-checked'),al:e.getAttribute('aria-label'),tid:e.dataset.testid||null,v:e.value?String(e.value).slice(0,30):null})),
      testids:[...p.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)};
  });
  return out;
};
