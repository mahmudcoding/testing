const WS='W4QCF1XTURESO01', EMPTY='C4QCEMPTY000001';
export default async ({page}) => {
  const r = await page.evaluate(async (ch)=>{
    const res = await fetch(`/api/v1/channels/${ch}/leave`, {method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}});
    return {status:res.status, body:(await res.text()).slice(0,180)};
  }, EMPTY);
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=channels`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>{const m=document.querySelector('main')||document.body;
    return m.innerText.replace(/\n+/g,' | ').slice(0,220);});
  return {leave:r, directoryAfter:after};
};
