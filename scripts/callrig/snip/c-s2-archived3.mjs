const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  const out={};
  const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET')
    resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,56)}); });
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const row = page.locator('[data-message-id]').last();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(900);
  // 1. reaction
  await row.locator('button[aria-label="Add reaction"]').first().click({timeout:10000});
  await page.waitForTimeout(1800);
  try { await page.locator('input[aria-label="Search emoji"]').last().fill('rocket'); await page.waitForTimeout(1200);
        await page.locator('button[aria-label="Rocket"]').last().click({timeout:8000}); out.reactClicked=true; }
  catch(e){ out.reactErr=String(e).slice(0,80); }
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  out.afterReact = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {text:el.innerText.replace(/\n+/g,' | ').slice(0,80),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3)};
  });
  // 2. pin
  await row.hover(); await page.waitForTimeout(800);
  try { await row.locator('button[aria-label="More actions"]').first().click({timeout:8000});
        await page.waitForTimeout(1200);
        await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Pin message$/}).last().click({timeout:8000});
        out.pinClicked=true; } catch(e){ out.pinErr=String(e).slice(0,80); }
  await page.waitForTimeout(3000);
  out.afterPin = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return {toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3),
      viewAll:(document.body.innerText.match(/View all \(\d+\)/)||[null])[0]};
  });
  out.resp = resp;
  return out;
};
