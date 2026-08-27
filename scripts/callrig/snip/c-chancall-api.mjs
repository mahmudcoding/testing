export default async ({page}) => {
  const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async (o)=>{
    const res = await fetch('/api/v1/meeting',{method:'POST',credentials:'include',headers:{'content-type':'application/json'},
      body: JSON.stringify({channel_id:o.CH, workspace_id:o.WS, name:'QA-C-CHAN'})});
    return {s:res.status, t:(await res.text()).slice(0,300)};
  }, {WS,CH});
  return r;
};
