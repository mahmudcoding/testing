export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const btns=await page.$$('button');
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim();
    if(/^Notifications/.test(l)){ await b.click(); break; } }
  await page.waitForTimeout(4500);
  return await page.evaluate(()=>{
    const all=[...document.querySelectorAll('div,section,aside')]
      .filter(e=>/Mark all as read/.test(e.innerText||''));
    const p=all.sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    return p?{text:p.innerText.replace(/\n+/g,' | ').slice(0,400)}:{none:true};
  });
};
