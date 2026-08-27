export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  // hover the last message to reveal actions, then click "Add reaction"
  const rows=await page.$$('[data-message-id]');
  if(!rows.length) return {err:'no messages'};
  await rows[rows.length-1].hover();
  await page.waitForTimeout(1200);
  const btns=await page.$$('button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim(); if(/add reaction/i.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no Add reaction button'};
  await page.waitForTimeout(2000);
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')];
    const m=ms[ms.length-1];
    if(!m) return {none:true};
    const btns=[...m.querySelectorAll('button')].slice(0,10).map((b,i)=>({i, aria:b.getAttribute('aria-label'), cp:[...(b.textContent||'')].map(c=>c.codePointAt(0).toString(16))}));
    return {first10: btns};
  });
};
