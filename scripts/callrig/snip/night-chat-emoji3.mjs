export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const rows=await page.$$('[data-message-id]');
  const out=[];
  for (let i=0;i<rows.length;i++){
    await rows[i].hover(); await page.waitForTimeout(900);
    const btns=await rows[i].$$('button');
    const labels=[]; for (const b of btns){ labels.push(((await b.getAttribute('aria-label'))||'').trim()); }
    out.push({i, labels});
    if (labels.some(l=>/react/i.test(l))){
      for (const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim(); if(/react/i.test(l)){ await b.click({timeout:8000}).catch(()=>{}); break; } }
      await page.waitForTimeout(2000);
      const picker=await page.evaluate(()=>{
        const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')];
        const m=ms[ms.length-1];
        if(!m) return null;
        return [...m.querySelectorAll('button')].slice(0,10).map((b,k)=>({k, aria:b.getAttribute('aria-label'), cp:[...(b.textContent||'')].map(c=>c.codePointAt(0).toString(16))}));
      });
      return {rowsScanned: out, picker};
    }
  }
  return {rowsScanned: out, picker: null};
};
