export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(9000);
  const msg = page.locator('main [data-message-id]').last();
  await msg.scrollIntoViewIfNeeded();
  await msg.hover();
  await page.waitForTimeout(1200);
  const fwd = page.locator('button[aria-label="Forward"]').last();
  const n = await fwd.count();
  let clicked='no';
  try { await fwd.click({timeout:5000}); clicked='ok'; }
  catch(e){ clicked='FAIL '+String(e.message).split('\n')[0].slice(0,60); }
  await page.waitForTimeout(3500);
  const dlg = await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    if(!d) return {dialog:false};
    const rows=[...d.querySelectorAll('button,li,[role="option"],[role="listitem"]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40);
    return {dialog:true, title:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,60),
            rows:[...new Set(rows)].slice(0,20)};
  });
  return {forwardButtons:n, clicked, dlg};
};
