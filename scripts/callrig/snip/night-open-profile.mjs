export default async ({page}) => {
  const who=process.env.QA_WHO||'QA Admin';
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const btns=await page.$$('main button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim(); if(l==="Open "+who+"'s profile"){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no profile button', labels: await page.evaluate(()=>[...document.querySelectorAll('main button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,12))};
  await page.waitForTimeout(3500);
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],aside')];
    const m=ms[ms.length-1];
    return {panel: m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,300),
      buttons:[...m.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28), t:b.getAttribute('data-testid')}))}:null};
  });
};
