export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  const bodies=[];
  const onReq=(r)=>{const u=r.url();
    if(u.includes('/api/v1/messaging/messages')&&r.method()==='POST'){
      try{ bodies.push(r.postData()||''); }catch(e){}
    }};
  page.on('request',onReq);
  await comp.click();
  // type the handle by hand and dismiss any suggestion popup with Escape
  await page.keyboard.type('@qa_c_bob');
  await page.waitForTimeout(1800);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.keyboard.type(' QA-MENTIONRECHECK');
  await page.waitForTimeout(800);
  const typed=await comp.evaluate(e=>e.innerText.trim().slice(0,40));
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  const b=bodies.find(x=>x.includes('MENTIONRECHECK'))||bodies[0]||'';
  let parsed=null; try{parsed=JSON.parse(b)}catch(e){}
  return {typed, requestKeys:parsed?Object.keys(parsed):null,
    mentionField: parsed? (parsed.mention_user_ids ?? parsed.mention_ids ?? 'ABSENT') : 'unparsed',
    bodySent: parsed? String(parsed.body).slice(0,40) : b.slice(0,80)};
};
