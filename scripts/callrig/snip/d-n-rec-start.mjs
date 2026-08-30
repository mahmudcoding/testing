export default async ({page}) => {
  const out={};
  const b = page.locator('button', {hasText:/^Record$/}).first();
  out.recBtn = await b.count();
  if(!out.recBtn){ out.btns = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>1).map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim()).filter(Boolean).slice(0,45)); return out; }
  await b.click(); await page.waitForTimeout(2500);
  out.dialog = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); return r.width>1&&r.height>1;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(d=>d.querySelectorAll('button').length<=8);
    const d=ds[ds.length-1]; if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,500),
      btns:[...d.querySelectorAll('button')].map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim()).filter(Boolean)};
  });
  const sr = page.locator('button', {hasText:/^Start recording$/}).last();
  if (await sr.count()>0){ await sr.click(); out.startedClicked=true; await page.waitForTimeout(6000); }
  out.after = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return {rec:[...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/record/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,80)))],
      toolbar:[...document.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim()).filter(Boolean).slice(-18)};
  });
  return out;
};
