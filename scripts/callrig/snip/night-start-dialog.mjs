export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(2500);
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')];
    const m=ms[ms.length-1];
    if(!m) return {none:true, main:(document.querySelector('main')||document.body).innerText.slice(0,200)};
    return {text:m.innerText.replace(/\n+/g,' | ').slice(0,700),
      controls:[...m.querySelectorAll('button,input,[role="radio"],[role="switch"],select,textarea')].map(e=>({
        tag:e.tagName.toLowerCase(), role:e.getAttribute('role'),
        l:(e.getAttribute('aria-label')||e.textContent||e.placeholder||'').trim().slice(0,42),
        t:e.getAttribute('data-testid'), checked:e.getAttribute('aria-checked'), d:e.disabled}))};
  });
};
