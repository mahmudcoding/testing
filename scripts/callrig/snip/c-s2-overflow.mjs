const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const out={};
  const send = async (text, tag) => {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.evaluate((t)=>{
      const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
      c.focus(); document.execCommand('insertText', false, t);
    }, text);
    await page.waitForTimeout(1200);
    await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
    return await page.evaluate((tg)=>{
      const el=[...document.querySelectorAll('[data-message-id]')].pop();
      const leaves=[...el.querySelectorAll('*')].filter(e=>e.children.length===0);
      const clipped=leaves.filter(e=>e.scrollWidth > e.clientWidth+1)
        .map(e=>({tag:e.tagName, sw:e.scrollWidth, cw:e.clientWidth, txt:(e.textContent||'').slice(0,24)}));
      const r=el.getBoundingClientRect();
      return {tag:tg, msgRect:{x:Math.round(r.x), w:Math.round(r.width), right:Math.round(r.right)},
        viewport:innerWidth, docScrollW:document.documentElement.scrollWidth, docClientW:document.documentElement.clientWidth,
        pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        clippedLeaves: clipped.slice(0,4), leafCount:leaves.length,
        msgOverflowsViewport: r.right > innerWidth};
    }, tag);
  };
  out.longWord = await send('QA-S2-OVF-A '+'x'.repeat(400), 'long-unbroken-word');
  out.longLink = await send('QA-S2-OVF-B https://example.com/'+'segment-'.repeat(60)+'end', 'long-link');
  out.emojiOnly = await send('🎉🎉🎉', 'emoji-only');
  return out;
};
