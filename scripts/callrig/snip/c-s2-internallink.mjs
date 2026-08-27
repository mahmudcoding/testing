const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001', GEN='C4QCGENERAL0001';
export default async ({page, ctx}) => {
  await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}).catch(()=>{});
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  // send a target message and copy its link
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-INTLINK-TARGET'); await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
  const row = page.locator('[data-message-id]').last();
  await row.hover(); await page.waitForTimeout(900);
  await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Share$/}).last().click({timeout:8000});
  await page.waitForTimeout(2000);
  out.link = await page.evaluate(async ()=>{ try { return await navigator.clipboard.readText(); } catch(e){ return 'ERR'; } });
  // paste it into the other channel
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.evaluate((link)=>{
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    c.focus(); document.execCommand('insertText', false, link);
  }, out.link);
  await page.waitForTimeout(2500);
  out.composerPreview = await page.evaluate(()=>{
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=c; for(let i=0;i<6&&box;i++) box=box.parentElement;
    return box? box.innerText.replace(/\n+/g,' | ').slice(-200):null;
  });
  await page.keyboard.press('Enter'); await page.waitForTimeout(4500);
  out.sent = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {text: el? el.innerText.replace(/\n+/g,' | ').slice(0,200):null,
      buttons: el? [...el.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)).filter(Boolean):null};
  });
  return out;
};
