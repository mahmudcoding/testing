const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-SHARE-TARGET');
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  const out={};
  const last = page.locator('[data-message-id]').last();
  out.msgId = await last.getAttribute('data-message-id');
  await last.hover(); await page.waitForTimeout(700);
  await page.locator('button[aria-label="More actions"]').last().click({timeout:8000});
  await page.waitForTimeout(1500);
  out.menu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const pops=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"],[role="dialog"]')].filter(vis);
    const p=pops[pops.length-1];
    return p? {text:p.innerText.replace(/\n+/g,' | ').slice(0,240),
      items:[...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28)).filter(Boolean)}:null;
  });
  return out;
};
