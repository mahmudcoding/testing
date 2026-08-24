export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const list = await page.evaluate(()=>({
    text: document.querySelector('main').innerText.replace(/\n+/g,' | ').slice(0,500),
    btns: [...document.querySelectorAll('main button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)}#${b.getAttribute('data-testid')||'-'}`).slice(0,30)
  }));
  // open Bob's profile
  const bob = await page.$('text=QA Bob');
  let prof=null;
  if (bob) { await bob.click().catch(()=>{}); await page.waitForTimeout(3000);
    prof = await page.evaluate(()=>({
      dialogs: [...document.querySelectorAll('[role="dialog"]')].map(d=>d.innerText.replace(/\n+/g,' | ').slice(0,400)),
      btns: [...document.querySelectorAll('[role="dialog"] button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)}#${b.getAttribute('data-testid')||'-'}`)
    })); }
  return {list, prof};
};
