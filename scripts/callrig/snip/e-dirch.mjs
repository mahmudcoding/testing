export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=channels`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const out = await page.evaluate(() => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const main = document.querySelector('main')||document.body;
    // rows
    const rows = [...main.querySelectorAll('[class*=row],[data-testid],li,tr')].filter(vis);
    const txt = main.innerText.slice(0,1800);
    const inputs = [...main.querySelectorAll('input,select')].filter(vis).map(i=>({t:i.type,ph:i.placeholder,al:i.getAttribute('aria-label'),v:i.value}));
    const btns = [...main.querySelectorAll('button,[role=tab],a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,50);
    return {txt, inputs, btns};
  });
  return out;
};
