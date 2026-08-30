export default async ({page}) => {
  const out={};
  const b = page.locator('[data-testid="recording-start-access-trigger"]').first();
  out.recBtn = await b.count();
  if(!out.recBtn) return out;
  out.label0 = (await b.getAttribute('aria-label')) || (await b.innerText());
  await b.click(); await page.waitForTimeout(2500);
  out.dialog = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); return r.width>1&&r.height>1;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(d=>d.querySelectorAll('button').length<=10);
    const d=ds[ds.length-1]; if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,600),
      btns:[...d.querySelectorAll('button')].map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim()).filter(Boolean),
      testids:[...d.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).slice(0,20),
      radios:[...d.querySelectorAll('input,[role=radio],[role=checkbox],[role=switch]')].map(e=>({r:e.getAttribute('role')||e.type,ck:e.checked??e.getAttribute('aria-checked'),al:e.getAttribute('aria-label')}))};
  });
  const sr = page.locator('button', {hasText:/^Start recording$/}).last();
  out.srCount = await sr.count();
  if (out.srCount>0){ await sr.click(); out.startedClicked=true; await page.waitForTimeout(7000); }
  out.after = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return {rec:[...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/record/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,80)))],
      toolbar:[...document.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim()).filter(Boolean).slice(-16)};
  });
  return out;
};
