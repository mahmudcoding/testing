export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  const tag='QA-ATHERE-'+Math.random().toString(36).slice(2,5);
  const bodies=[];
  const onReq=(r)=>{const u=r.url();
    if(u.includes('/api/v1/messaging/messages')&&r.method()==='POST'){
      try{ bodies.push(String(r.postData()||'')); }catch(e){} }};
  page.on('request',onReq);
  await comp.click();
  await page.keyboard.type('@here');
  await page.waitForTimeout(2200);
  const sugg=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const l=[...document.querySelectorAll('[role="listbox"],[role="menu"]')].filter(v)[0];
    return l?[...l.querySelectorAll('[role="option"],[role="menuitem"],button')].filter(v)
      .map(o=>(o.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)).slice(0,3):'none';});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  await page.keyboard.type(' '+tag);
  await page.waitForTimeout(800);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  const b=bodies.find(x=>x.includes('ATHERE'))||bodies[0]||'';
  let parsed=null; try{parsed=JSON.parse(b)}catch(e){}
  return {tag, suggestions:sugg, requestKeys:parsed?Object.keys(parsed):null,
    mentionHere:parsed?(parsed.mention_here??parsed.mention_all??'no flag'):'unparsed',
    body:parsed?String(parsed.body).slice(0,34):b.slice(0,60)};
};
