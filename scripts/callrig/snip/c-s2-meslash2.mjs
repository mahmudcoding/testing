export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  const out={};
  await comp.click();
  await page.keyboard.type('/');
  await page.waitForTimeout(2200);
  const item=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const l=[...document.querySelectorAll('[role="listbox"],[role="menu"]')].filter(v)[0];
    if(!l) return null;
    return [...l.querySelectorAll('[role="option"],[role="menuitem"],button')].filter(v)
      .find(o=>/\/me\b/.test((o.innerText||''))) || null;});
  const el=item.asElement(); out.itemFound=!!el;
  if(!el) return out;
  out.itemText=await el.evaluate(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30));
  await el.click({timeout:6000}).catch(()=>{out.pickErr=true});
  await page.waitForTimeout(2500);
  out.composerAfterPick=await comp.evaluate(e=>e.innerText.trim().slice(0,20));
  await comp.click(); await page.keyboard.press('End');
  await page.keyboard.type(' PS-RC2 waves');
  await page.waitForTimeout(800);
  out.beforeSend=await comp.evaluate(e=>e.innerText.trim().slice(0,30));
  const posts=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/messaging/messages')&&r.method()==='POST')
    {try{posts.push(String(r.postData()||'').slice(0,90));}catch(e){}}};
  page.on('request',onReq);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.postBody=posts[0]||null;
  out.inFeed=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')].reverse();
    const hit=els.find(e=>/PS-RC2 waves/.test(e.innerText||''));
    return hit?(hit.innerText||'').replace(/\s+/g,' ').trim().slice(-40):'not found';});
  return out;
};
