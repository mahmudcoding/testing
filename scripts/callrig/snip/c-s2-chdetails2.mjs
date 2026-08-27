export default async ({page}) => {
  const btn = page.locator('button[aria-label="Channel details"]').first();
  let opened='no';
  try { await btn.click({timeout:6000}); opened='ok'; }
  catch(e){ opened='FAIL '+String(e.message).split('\n')[0].slice(0,50); }
  await page.waitForTimeout(3500);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const cands=[...document.querySelectorAll('[role="dialog"],aside,section,div')].filter(v)
      .filter(e=>/Members|About|Settings|Role/i.test(e.innerText||''))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const p=cands[0];
    if(!p) return {found:false};
    const btns=[...p.querySelectorAll('button,[role="tab"],select,input')].filter(v)
      .map(e=>`${e.tagName.toLowerCase()}:${(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').replace(/\s+/g,' ').trim().slice(0,30)}`);
    return {found:true, text:(p.innerText||'').replace(/\s+/g,' ').trim().slice(0,220),
            controls:[...new Set(btns)].slice(0,20)};
  });
};
