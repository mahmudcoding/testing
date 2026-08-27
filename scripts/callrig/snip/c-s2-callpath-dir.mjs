const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const out={};
  // start a call from the person row
  const rows = page.locator('main button, main a').filter({hasText:/^Call$/});
  out.callButtons = await rows.count();
  // find the Call button in QA Carol's row
  const idx = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const btns=[...document.querySelectorAll('main button, main a')].filter(vis).filter(b=>/^Call$/.test((b.textContent||'').trim()));
    for (let i=0;i<btns.length;i++){
      let p=btns[i]; for(let k=0;k<5&&p;k++) p=p.parentElement;
      if (p && /QA Carol/.test(p.innerText||'')) return i;
    }
    return -1;
  });
  out.carolIdx = idx;
  if (idx>=0) {
    await rows.nth(idx).click({timeout:8000});
    const t=Date.now();
    await page.waitForTimeout(6000);
    out.started = {epoch:t, iso:new Date(t).toISOString(), url:page.url()};
  }
  return out;
};
