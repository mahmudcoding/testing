const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={}; const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET') resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,60)}); });
  const dlg = (t) => page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? {tag, text:d.innerText.replace(/\n+/g,' | ').slice(0,240),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)).filter(Boolean)}:{tag, none:true};
  }, t);
  await page.locator('button[aria-label$="members"], button[aria-label$="member"]').last().click({timeout:8000});
  await page.waitForTimeout(2200);
  out.open = await dlg('open');
  // add bob so there is someone to mute
  const addBob = page.locator('[role="dialog"] button').filter({hasText:/QA Bob/}).first();
  if (await addBob.count()) { await addBob.click({timeout:6000}); await page.waitForTimeout(700);
    const add = page.locator('[role="dialog"] button').filter({hasText:/^Add selected/}).first();
    if (await add.count() && !(await add.isDisabled())) { await add.click({timeout:6000}); await page.waitForTimeout(3000); } }
  out.afterAdd = await dlg('after-add');
  // mute
  try { await page.locator('button[aria-label^="Mute QA Bob"]').first().click({timeout:8000}); out.muteClicked=true; } catch(e){ out.muteErr=String(e).slice(0,90); }
  await page.waitForTimeout(3000);
  out.afterMute = await dlg('after-mute');
  out.resp = resp;
  return out;
};
