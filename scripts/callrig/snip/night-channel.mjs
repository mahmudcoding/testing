export default async ({page}) => {
  const ch = process.env.QA_CH || 'C4QAGENERAL0001';
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/'+ch,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const header=document.querySelector('header')||document.querySelector('main');
    return {url: location.href,
      headerText: header?header.innerText.replace(/\n+/g,' | ').slice(0,250):null,
      buttons:[...document.querySelectorAll('main button, header button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,36), t:b.getAttribute('data-testid')})).filter(b=>b.l).slice(0,25),
      callish:[...document.querySelectorAll('[data-testid*="call" i]')].map(e=>e.getAttribute('data-testid')).slice(0,15)};
  });
};
