const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const created = await page.evaluate(async (ws)=>{
    const r = await fetch('/api/v1/channels', {method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name:'qa-c2-mgmt', type:'public', workspace_id: ws})});
    return {status:r.status, body:(await r.text()).slice(0,300)};
  }, WS);
  return created;
};
