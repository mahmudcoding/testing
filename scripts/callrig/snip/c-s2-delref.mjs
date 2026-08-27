const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  // A: pinned message, then delete it
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-DELPIN'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const row = page.locator('[data-message-id]').last();
  await row.hover(); await page.waitForTimeout(800);
  await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Pin message$/}).last().click({timeout:8000});
  await page.waitForTimeout(3000);
  const banner=()=>page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    return [...document.querySelectorAll('div,span,p,button')].filter(e=>e.children.length===0 && /Pinned message|View all \(/.test(e.textContent||''))
      .map(e=>({t:(e.textContent||'').trim().slice(0,50), vis:vis(e)}));
  });
  out.afterPin = await banner();
  // delete it
  await row.hover(); await page.waitForTimeout(800);
  await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(1500);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(4000);
  out.afterDelete = await banner();
  out.afterDeleteRow = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return el? el.innerText.replace(/\n+/g,' | ').slice(0,70):null;
  });
  // fresh load
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  out.afterReload = await banner();
  out.pinnedPanel = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'});
    const j=await r.json();
    return (j.messages||[]).slice(0,4).map(m=>({body:(m.body||'').slice(0,20), pinned:m.pinned}));
  }, PRIV);
  return out;
};
