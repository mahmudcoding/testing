export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const msg = page.locator('[data-message-id]').last();
  const id = await msg.getAttribute('data-message-id');
  const t = (await msg.innerText()).slice(0,300);
  const btns = await msg.evaluate(m => [...m.querySelectorAll('button,a')]
     .filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;})
     .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,40)).filter(Boolean));
  return {id, rendered: t, controls: btns.slice(0,12)};
};
