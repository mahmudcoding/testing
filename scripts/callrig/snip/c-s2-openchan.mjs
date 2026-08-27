export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch=process.env.QA_CH||'C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  return {url:page.url(), rendered:await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length),
    lastText:await page.evaluate(()=>{const e=[...document.querySelectorAll('main [data-message-id]')].slice(-1)[0];
      return e? (e.innerText||'').replace(/\s+/g,' ').slice(0,50):null;})};
};
