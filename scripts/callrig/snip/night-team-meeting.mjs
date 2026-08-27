export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const btns=await page.$$('main button');
  let clicked=null;
  for (const b of btns){ const t=(await b.innerText()).trim(); if(/^Team meeting/.test(t)){ await b.click(); clicked=t.slice(0,40); break; } }
  if(!clicked) return {err:'no Team meeting button'};
  await page.waitForTimeout(2500);
  return await page.evaluate((c)=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')];
    const m=ms[ms.length-1];
    return {clicked:c, dialog: m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,400),
      nameValue:(i=>i?i.value:null)(m.querySelector('#calls-hub-call-name'))}:null};
  }, clicked);
};
