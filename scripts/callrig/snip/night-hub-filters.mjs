export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const counts=await page.evaluate(()=>{
    const m=document.querySelector('main');
    const txt=m.innerText.replace(/\n+/g,' | ');
    const f=[...m.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(t=>/·\s*\d+|·\d+/.test(t));
    return {filters:f, rows:[...m.querySelectorAll('[data-testid*="recent" i]')].length};
  });
  // count rows under each filter
  const out={};
  for (const label of ['All','Group meetings','1-to-1']){
    const btns=await page.$$('main button');
    for (const b of btns){ const t=(await b.innerText()).trim(); if(t.startsWith(label)){ await b.click(); await page.waitForTimeout(2500); break; } }
    out[label]=await page.evaluate(()=>{
      const m=document.querySelector('main');
      // recent call rows are links to /calls/<id>
      return [...m.querySelectorAll('a[href*="/calls/"]')].length;
    });
  }
  return {counts, rowsPerFilter: out};
};
