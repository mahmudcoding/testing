export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', id=process.env.MID;
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4500);
  return await page.evaluate(mid=>{
    const m=document.querySelector(`[data-message-id="${mid}"]`);
    return {present:!!m, text:m?m.innerText.replace(/\s+/g,' ').slice(0,90):null,
      count:document.querySelectorAll('[data-message-id]').length,
      bodyHasText:/QA-C-HIDEME-TARGET/.test(document.body.innerText)};
  }, id);
};
