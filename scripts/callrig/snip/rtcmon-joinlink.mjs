export default async ({page}) => {
  const steps=[];
  await page.goto('https://staging.airion-cargo.store/join/4a2f288ff459b53f2c2aaeec8ed0b1637d42cd7e1403b9a8eec9544dddf82afc',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  steps.push('url: '+await page.evaluate(()=>location.pathname));
  steps.push('text: '+await page.evaluate(()=>(document.querySelector('main')?.innerText||document.body.innerText).replace(/\s+/g,' ').slice(0,260)));
  steps.push('buttons: '+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>(b.textContent||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,20))));
  return steps;
};
