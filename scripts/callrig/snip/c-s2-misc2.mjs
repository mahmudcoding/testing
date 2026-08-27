const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001', GEN='C4QCGENERAL0001';
export default async ({page, ctx}) => {
  await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}).catch(()=>{});
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  // find a message whose only content is an attachment
  out.found = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('[data-message-id]')];
    const hit=els.filter(e=>e.querySelector('button[aria-label^="Open qa-s2-pic"]') || e.querySelector('img'));
    return hit.length? {id:hit[hit.length-1].getAttribute('data-message-id'),
      text:hit[hit.length-1].innerText.replace(/\n+/g,' | ').slice(0,60)} : null;
  });
  if (out.found) {
    const att = page.locator(`[data-message-id="${out.found.id}"]`).first();
    await att.scrollIntoViewIfNeeded().catch(()=>{});
    await att.hover(); await page.waitForTimeout(900);
    await att.locator('button[aria-label="More actions"]').first().click({timeout:10000});
    await page.waitForTimeout(1300);
    out.menu = await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).pop();
      return p? [...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22)).filter(Boolean):null;
    });
    const ct = page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Copy text$/});
    out.copyTextPresent = await ct.count();
    if (out.copyTextPresent) {
      await ct.last().click({timeout:8000}); await page.waitForTimeout(1800);
      out.clipboard = await page.evaluate(async ()=>{
        try { const t=await navigator.clipboard.readText(); return {len:t.length, text:JSON.stringify(t.slice(0,60))}; }
        catch(e){ return {err:String(e).slice(0,50)}; }
      });
      out.toast = await page.evaluate(()=>{
        const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
        return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2);
      });
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  }
  // thread draft: navigate fully away, then back
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6500);
  const p = page.locator('[data-message-id]').last();
  await p.hover(); await page.waitForTimeout(800);
  await p.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(3500);
  const threadUrl = page.url();
  const tcomp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await tcomp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-TD2');
  await page.waitForTimeout(1200);
  // go to another channel entirely, then a full reload of the thread URL
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(threadUrl,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  out.threadDraftAfterReload = await page.evaluate(()=>{
    const cs=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')];
    return {composers:cs.length, lastText: cs.length? cs[cs.length-1].innerText.replace(/\n/g,'\\n').slice(0,40):null,
      channelText: cs.length>1? cs[0].innerText.replace(/\n/g,'\\n').slice(0,40):null};
  });
  return out;
};
