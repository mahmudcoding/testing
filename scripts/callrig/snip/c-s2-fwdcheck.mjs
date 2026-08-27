export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dst='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  await page.waitForTimeout(7500);
  return page.evaluate(()=>{
    const hits=[...document.querySelectorAll('main [data-message-id]')]
      .filter(e=>/QA-S2-FWDATT/.test(e.innerText||''));
    return hits.map(e=>({id:e.getAttribute('data-message-id'),
      imgs:e.querySelectorAll('img').length,
      text:(e.innerText||'').replace(/\s+/g,' ').slice(0,120),
      fileBtns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
        .filter(l=>l&&/Preview|Download|Open q/.test(l))}));
  });
};
