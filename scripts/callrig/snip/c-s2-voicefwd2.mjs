export default async ({page}) => {
  const ws='W4QCF1XTURESO01', src='C4QCPRIVATE0001', dst='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${src}`);
  await page.waitForTimeout(7000);
  const el=page.locator('[data-message-id="M4OWWGYTA4NS9ZU"]').first();
  out.found=await el.count();
  if(!out.found) return out;
  out.srcShape=await el.evaluate(e=>({txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,50),
    playBtn:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(l=>l&&/Play/.test(l)).length}));
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2300);
  await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    const cand=[...d.querySelectorAll('button,[role="option"],li')]
      .filter(e=>/qa-general/.test((e.textContent||'')) && e.getBoundingClientRect().height>10);
    cand[cand.length-1].setAttribute('data-qa-dest','1');});
  await page.locator('[data-qa-dest="1"]').click(); await page.waitForTimeout(1300);
  await page.locator('[role="dialog"] button').filter({hasText:/^Continue$/}).first().click();
  await page.waitForTimeout(2000);
  await page.locator('[role="dialog"] button').filter({hasText:/^(Forward|Send)$/}).first().click();
  await page.waitForTimeout(4500);
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  const s=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(700);
    s.push(await page.evaluate(()=>{
      const els=[...document.querySelectorAll('main [data-message-id]')].slice(-3);
      return els.map(e=>({txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,70),
        audio:e.querySelectorAll('audio').length,
        play:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(l=>l&&/Play/.test(l)).length}));
    }));
  }
  out.dstTail=s.at(-1);
  return out;
};
