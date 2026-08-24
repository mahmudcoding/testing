export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  return await page.evaluate(() => {
    const m = document.querySelector('main') || document.body;
    return {
      url: location.href,
      text: m.innerText.replace(/\n+/g,' | ').slice(0,1500),
      buttons: [...m.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,50), t:b.getAttribute('data-testid')})).filter(x=>x.l||x.t).slice(0,60),
      tabs: [...document.querySelectorAll('[role="tab"]')].map(t=>t.textContent.trim()),
      links: [...m.querySelectorAll('a')].map(a=>a.getAttribute('href')).filter(Boolean).slice(0,30)
    };
  });
};
