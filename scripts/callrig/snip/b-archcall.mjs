export default async ({page}) => {
  const WS='W4QBF1XTURESO01', CH='C4QBARCHIVE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.state = await page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0 && el.getBoundingClientRect().height>0;
    const m=document.querySelector('main')||document.body;
    const t=m.innerText.replace(/\s+/g,' ');
    return {
      archivedBanner:(t.match(/.{0,60}archiv.{0,80}/i)||[])[0]||null,
      callButtons:[...m.querySelectorAll('button')].filter(vis).map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim(), dis:b.disabled})).filter(x=>/call/i.test(x.t)),
      composer: !!document.querySelector('div[contenteditable="true"]')
    };
  });
  return out;
};
