const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  const out={}; const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET')
    resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,50)}); });
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  await page.locator('button[aria-label="Open QA Carol\'s profile"]').first().click({timeout:10000});
  await page.waitForTimeout(2200);
  await page.locator('[role="dialog"] button').filter({hasText:/^Share$/}).last().click({timeout:10000});
  await page.waitForTimeout(2200);
  const dlg=(t)=>page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? {tag, text:d.innerText.replace(/\n+/g,' | ').slice(0,220),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24), dis:b.disabled}))}:{tag,none:true};
  }, t);
  out.picker = await dlg('picker');
  resp.length=0;
  await page.locator('[role="dialog"] button').filter({hasText:/^qa-private$/}).first().click({timeout:8000});
  await page.waitForTimeout(2500);
  out.afterPick = await dlg('after-pick');
  out.respAfterPick = resp.slice();
  // look for any confirm control anywhere on screen
  out.confirmCandidates = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim())
      .filter(t=>/^(Send|Share|Continue|Confirm|Done)$/i.test(t));
  });
  out.toasts = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3);
  });
  return out;
};
