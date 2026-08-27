export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const m = document.querySelector('main') || document.body;
    return {
      url: location.href,
      text: m.innerText.replace(/\n+/g,' | ').slice(0,1500),
      buttons: [...m.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,45), t:b.getAttribute('data-testid'), d:b.disabled})).filter(x=>x.l||x.t),
      inputs: [...m.querySelectorAll('input,select')].map(i=>({ph:i.placeholder, al:i.getAttribute('aria-label'), t:i.type, v:String(i.value).slice(0,30)})),
      tabs: [...m.querySelectorAll('[role="tab"]')].map(t=>({l:t.textContent.trim(), sel:t.getAttribute('aria-selected')})),
      testids: [...new Set([...m.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,60)
    };
  });
};
