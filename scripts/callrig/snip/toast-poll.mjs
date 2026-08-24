export default async ({page}) => {
  const name = 'Q'.repeat(Number(process.env.QA_LEN||300));
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1200);
  await page.fill('#calls-hub-call-name', name);

  const seen = [];
  let stop = false;
  const poll = (async () => {
    for (let i=0; i<60 && !stop; i++) {          // 12s at 200ms
      const t = await page.evaluate(() => [...document.querySelectorAll('[role="status"],[role="alert"],li[data-state]')]
        .map(e => e.innerText.trim().replace(/\n+/g,' ')).filter(Boolean));
      for (const x of t) if (!seen.some(s=>s.text===x)) seen.push({t: i*200+'ms', text: x});
      await page.waitForTimeout(200);
    }
  })();

  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(12000);
  stop = true; await poll;

  const after = await page.evaluate(()=>({dialogOpen: !!document.querySelector('[data-testid="calls-start-submit"]')}));
  return {nameLen: name.length, toastsSeen: seen, after};
};
