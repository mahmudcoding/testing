const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page, ctx}) => {
  await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}).catch(()=>{});
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  // 1) emoji picker: categories and any recents section
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.locator('button[aria-label="Add emoji"]').last().click({timeout:10000});
  await page.waitForTimeout(2000);
  out.picker = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="dialog"]')].filter(vis).pop();
    if(!p) return null;
    const t=p.innerText;
    return {sections:(t.match(/[A-Z][A-Z &]{3,}/g)||[]).slice(0,10),
      hasRecent:/recent|frequently|часто/i.test(t),
      buttonCount:[...p.querySelectorAll('button')].filter(vis).length,
      head:t.replace(/\n+/g,' | ').slice(0,120)};
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  // 2) hover a reaction chip -> peek
  const react = page.locator('[data-message-id]').filter({hasText:'QA-S2-REACT-TARGET'}).last();
  if (await react.count()) {
    await react.scrollIntoViewIfNeeded().catch(()=>{});
    const chip = react.locator('button[aria-label^="View "]').first();
    if (await chip.count()) {
      await chip.hover(); await page.waitForTimeout(1800);
      out.reactionPeek = await page.evaluate(()=>{
        const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
        const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="tooltip"]')].filter(vis).pop();
        return p? p.innerText.replace(/\n+/g,' | ').slice(0,140):null;
      });
    }
  }
  // 3) copy text on a message containing a mention
  const m = page.locator('[data-message-id]').filter({hasText:'QA-S2-NOTIF-CONTROL'}).last();
  if (await m.count()) {
    await m.scrollIntoViewIfNeeded().catch(()=>{});
    await m.hover(); await page.waitForTimeout(900);
    out.renderedMention = ((await m.innerText().catch(()=>''))||'').replace(/\n+/g,' | ').slice(0,70);
    await m.locator('button[aria-label="More actions"]').first().click({timeout:10000});
    await page.waitForTimeout(1200);
    await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Copy text$/}).last().click({timeout:8000});
    await page.waitForTimeout(1800);
    out.clipboard = await page.evaluate(async ()=>{ try { return JSON.stringify(await navigator.clipboard.readText()); } catch(e){ return 'ERR'; } });
  }
  return out;
};
