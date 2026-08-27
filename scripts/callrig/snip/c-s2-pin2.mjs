const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  const out={};
  // close panel, post two more messages and pin them
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const pinLast = async (txt) => {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type(txt); await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
    const last = page.locator('[data-message-id]').last();
    await last.hover(); await page.waitForTimeout(600);
    await page.locator('button[aria-label="More actions"]').last().click({timeout:8000});
    await page.waitForTimeout(1000);
    await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Pin message$/}).last().click({timeout:8000});
    await page.waitForTimeout(2200);
    return await last.getAttribute('data-message-id');
  };
  out.id2 = await pinLast('QA-S2-PIN-ALPHA apple');
  out.id3 = await pinLast('QA-S2-PIN-BETA banana');
  out.banner = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    return [...document.querySelectorAll('div,span,p,button')].filter(e=>e.children.length===0 && /Pinned message|View all \(/.test(e.textContent||''))
      .map(e=>({t:(e.textContent||'').trim().slice(0,70), vis:vis(e)}));
  });
  await page.locator('button:visible').filter({hasText:/^View all \(/}).last().click({timeout:8000});
  await page.waitForTimeout(2200);
  const panel = () => page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,320),
      rows:(d.innerText.match(/QA-S2-PIN-\w+|QA-S2-SHARE-TARGET/g)||[]),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean)}:null;
  });
  out.panelAll = await panel();
  await page.locator('[role="dialog"] input:visible').first().fill('banana');
  await page.waitForTimeout(1800);
  out.panelSearchBanana = await panel();
  await page.locator('[role="dialog"] input:visible').first().fill('zzz-no-such');
  await page.waitForTimeout(1800);
  out.panelSearchNone = await panel();
  await page.locator('[role="dialog"] input:visible').first().fill('');
  await page.waitForTimeout(1500);
  out.panelCleared = await panel();
  return out;
};
