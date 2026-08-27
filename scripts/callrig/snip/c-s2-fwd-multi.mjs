const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-FWDMULTI'); await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  const msg = page.locator('[data-message-id]').last();
  await msg.hover(); await page.waitForTimeout(700);
  await msg.locator('button[aria-label="Forward"]').first().click({timeout:10000});
  await page.waitForTimeout(2500);
  const dlg = (t) => page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? {tag, text:d.innerText.replace(/\n+/g,' | ').slice(0,300),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26), dis:b.disabled}))}:null;
  }, t);
  out.step1 = await dlg('opened');
  // select two targets
  const picks=[];
  for (const name of ['qa-general','Saved Messages','QA Carol']) {
    const b = page.locator('[role="dialog"] button').filter({hasText:new RegExp(name)}).first();
    if (await b.count()) { await b.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(700); picks.push(name); }
    if (picks.length>=2) break;
  }
  out.picked = picks;
  out.step1b = await dlg('after-pick');
  return out;
};
