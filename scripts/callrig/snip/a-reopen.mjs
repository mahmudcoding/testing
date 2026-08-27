export default async ({page}) => {
  const id = process.env.QA_MEET;
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/'+id, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const read = () => {
    const s = document.querySelector('[data-testid="ended-rate-section"]');
    const b = document.body;
    return {
      url: location.href,
      hasSummary: !!document.querySelector('[data-testid="call-ended-summary"]'),
      rateSection: s ? {text: s.innerText.replace(/\n+/g,' | ').slice(0,200),
                        filled: [...s.querySelectorAll('button')].map(x=>(x.querySelector('svg')?.getAttribute('fill')||'?')).join(','),
                        labels: [...s.querySelectorAll('button')].map(x=>x.getAttribute('aria-label')).join('/')} : null,
      bodySlice: b.innerText.replace(/\n+/g,' | ').slice(0,400)
    };
  };
  const first = await page.evaluate(read);
  const api = await page.evaluate(async (id) => (await (await fetch('/api/v1/meeting/'+id,{credentials:'include'})).json()).meeting?.rating, id);
  await page.waitForTimeout(4000);
  const second = await page.evaluate(read);
  return {first, second, api};
};
