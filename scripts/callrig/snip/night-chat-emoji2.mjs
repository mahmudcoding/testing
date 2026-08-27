export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const rows=await page.$$('[data-message-id]');
  const row=rows[rows.length-1];
  await row.hover();
  await page.waitForTimeout(1500);
  const btns=await row.$$('button');
  const labels=[]; let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim(); labels.push(l);
    if(/add reaction|react/i.test(l)){ try{ await b.click({timeout:8000}); clicked=l; }catch(e){ clicked='FAILED: '+l; } break; } }
  await page.waitForTimeout(2000);
  const picker=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')];
    const m=ms[ms.length-1];
    if(!m) return null;
    return [...m.querySelectorAll('button')].slice(0,10).map((b,i)=>({i, aria:b.getAttribute('aria-label'), cp:[...(b.textContent||'')].map(c=>c.codePointAt(0).toString(16))}));
  });
  return {rowButtons: labels, clicked, picker};
};
