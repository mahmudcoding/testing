const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  const last = page.locator('[data-message-id]').last();
  // right-click a message → context menu?
  await last.click({button:'right'}).catch(e=>{out.rcErr=String(e).slice(0,60);});
  await page.waitForTimeout(1500);
  out.contextMenu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const pops=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis);
    return pops.map(p=>({text:p.innerText.replace(/\n+/g,' | ').slice(0,220),
      items:[...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)).filter(Boolean)}));
  });
  return out;
};
