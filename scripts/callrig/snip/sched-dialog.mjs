export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.locator('main button', {hasText:'Schedule meeting'}).first().click();
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    if(!d) return {none:true, body: document.body.innerText.slice(0,300)};
    return {text: d.innerText.replace(/\n+/g,' | ').slice(0,1200),
      fields: [...d.querySelectorAll('input,select,textarea')].map(i=>`${i.tagName}:${i.type||''}|${i.getAttribute('data-testid')||i.id||''}|${i.placeholder||''}|${i.getAttribute('aria-label')||''}|val=${(i.value||'').slice(0,26)}`),
      buttons: [...d.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40)}#${b.getAttribute('data-testid')||'-'}${b.getAttribute('aria-checked')!=null?' ac='+b.getAttribute('aria-checked'):''}`),
      testids: [...new Set([...d.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,35)};
  });
};
