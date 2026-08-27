const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\/messaging\/messages/.test(r.url()) && r.method()==='POST')
    reqs.push({post:(r.postData()||'').slice(0,320)}); });
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const out={};
  // @all
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  for (const c of '@all') { await page.keyboard.type(c); await page.waitForTimeout(300); }
  await page.waitForTimeout(1200); await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  await page.keyboard.type(' QA-S2-ATALL-REQ'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  // direct control
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  for (const c of '@Bob') { await page.keyboard.type(c); await page.waitForTimeout(300); }
  await page.waitForTimeout(1200); await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  await page.keyboard.type(' QA-S2-DIRECT-REQ'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.requests = reqs;
  out.stored = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=2`,{credentials:'include'});
    const j=await r.json();
    return (j.messages||[]).map(m=>({body:m.body, mention_ids:m.mention_ids===undefined?'(absent)':JSON.stringify(m.mention_ids)}));
  }, GEN);
  return out;
};
