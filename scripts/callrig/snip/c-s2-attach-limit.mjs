const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const inp=[...document.querySelectorAll('input[type=file]')].map(i=>({accept:i.getAttribute('accept'), multiple:i.multiple}));
    const txt=document.body.innerText;
    const m = txt.match(/max[^\n]{0,40}/gi) || [];
    return {fileInputs:inp, maxMentions:m.slice(0,5)};
  });
};
