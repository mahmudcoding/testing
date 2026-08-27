export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  const msg=page.locator('main [data-message-id]').last();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="Forward"]').first().click({timeout:6000}).catch(()=>{out.openFail=true});
  await page.waitForTimeout(3500);
  await page.locator('[role="dialog"] button').filter({hasText:'Saved Messages'}).first()
    .click({timeout:6000}).catch(()=>{out.pickFail=true});
  await page.waitForTimeout(1500);
  await page.locator('[role="dialog"] button').filter({hasText:/^Continue$/}).first()
    .click({timeout:6000}).catch(()=>{out.contFail=true});
  await page.waitForTimeout(3500);
  out.step2=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    if(!d) return 'NO-DIALOG';
    return {text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,140),
      inputs:[...d.querySelectorAll('input,textarea,div[contenteditable]')].filter(v)
        .map(i=>({tag:i.tagName.toLowerCase(), ph:i.getAttribute('placeholder')||'',
          aria:(i.getAttribute('aria-label')||'').slice(0,24)})),
      buttons:[...new Set([...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20)))]};});
  return out;
};
