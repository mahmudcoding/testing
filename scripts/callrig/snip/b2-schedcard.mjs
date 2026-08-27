export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const title = process.env.QA_TITLE || 'QA sched start';
  return await page.evaluate(t => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const cand = [...document.querySelectorAll('div,li,section,article')].filter(v)
      .filter(e=>(e.innerText||'').includes(t) && (e.innerText||'').length < 300);
    const min = cand.filter(e=>!cand.some(o=>o!==e && e.contains(o)));
    const card = min[min.length-1];
    return { found: !!card,
             text: card ? card.innerText.replace(/\n+/g,' | ').slice(0,180) : '(not on hub)',
             buttons: card ? [...card.querySelectorAll('button')].filter(v)
               .map(b=>({ t:(b.innerText||'').trim().slice(0,20), disabled:b.disabled })) : [],
             bodyHasTitle: (document.body.innerText||'').includes(t) };
  }, title);
};
