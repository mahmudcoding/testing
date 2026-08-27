const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const emo = process.env.QA_EMOJI || 'Rocket';
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const row = page.locator('[data-message-id]').filter({hasText:'QA-S2-REACT-TARGET'}).last();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(900);
  await row.locator('button[aria-label="Add reaction"]').first().click({timeout:10000});
  await page.waitForTimeout(1800);
  const out={};
  try { await page.locator('input[aria-label="Search emoji"]').last().fill(emo.toLowerCase()); await page.waitForTimeout(1300); } catch(e){ out.searchErr=String(e).slice(0,60); }
  try { await page.locator(`button[aria-label="${emo}"]`).last().click({timeout:8000}); out.picked=emo; }
  catch(e){ out.pickErr=String(e).slice(0,90); }
  await page.waitForTimeout(2500);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  out.row = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-REACT-TARGET/.test(m.innerText||'')).pop();
    return el? {text:el.innerText.replace(/\n+/g,' | ').slice(0,90),
      buttons:[...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean)}:null;
  });
  return out;
};
