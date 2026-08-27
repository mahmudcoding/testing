const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  const snap=(t)=>page.evaluate((tag)=>{
    const ids=[...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id'));
    return {tag, url:location.href.split('/w/')[1],
      n:ids.length, uniq:new Set(ids).size,
      composers:document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]').length,
      thread:/[?&]thread=/.test(location.href),
      repliesMarker:(document.body.innerText.match(/Replies \(\d+\)/)||[null])[0],
      header:(document.querySelector('main')?.innerText||'').split('\n')[0]};
  }, t);
  // open a thread in the private channel
  const p = page.locator('[data-message-id]').filter({hasText:'QA-S2-TNOTIF-PARENT'}).last();
  const anyMsg = (await p.count()) ? p : page.locator('[data-message-id]').last();
  await anyMsg.scrollIntoViewIfNeeded().catch(()=>{});
  await anyMsg.hover(); await page.waitForTimeout(900);
  await anyMsg.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(3500);
  out.threadOpen = await snap('thread-open');
  // switch to the other channel via the sidebar
  await page.locator(`a[href*="${GEN}"]`).first().click({timeout:10000});
  await page.waitForTimeout(5000);
  out.afterSwitch = await snap('after-switch-to-general');
  // switch back
  await page.locator(`a[href*="${PRIV}"]`).first().click({timeout:10000});
  await page.waitForTimeout(5000);
  out.backAgain = await snap('back-to-private');
  // rapid switching
  for (let i=0;i<4;i++){
    await page.locator(`a[href*="${GEN}"]`).first().click({timeout:8000}); await page.waitForTimeout(900);
    await page.locator(`a[href*="${PRIV}"]`).first().click({timeout:8000}); await page.waitForTimeout(900);
  }
  await page.waitForTimeout(6000);
  out.afterRapid = await snap('after-rapid-switching');
  return out;
};
