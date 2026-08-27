const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  const out={};
  // fresh load: did the reaction and pin persist in the archived channel?
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(9000);
  out.persisted = await page.evaluate(async (ch)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=2`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    const banner=[...document.querySelectorAll('div,span,p,button')].filter(e=>e.children.length===0 && /View all \(/.test(e.textContent||''))
      .map(e=>({t:(e.textContent||'').trim(), vis:vis(e)}));
    return {apiReactions: JSON.stringify(m.reactions||[]).slice(0,120), apiPinned: m.pinned,
      domText: el? el.innerText.replace(/\n+/g,' | ').slice(0,80):null,
      pinnedBanner: banner, composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')};
  }, CH);
  // now try edit + delete in the archived channel
  const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET')
    resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,52)}); });
  const row = page.locator('[data-message-id]').last();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(900);
  await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1300);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Edit$/}).last().click({timeout:8000});
  await page.waitForTimeout(2000);
  out.editMode = await page.evaluate(()=>({
    banner:/Editing message/.test(document.body.innerText),
    composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')}));
  if (out.editMode.composer) {
    await page.keyboard.type('-EDITED');
    await page.keyboard.press('Meta+Enter');
    await page.waitForTimeout(3500);
  }
  out.afterEdit = await page.evaluate(async (ch)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    return {body:(m.body||'').slice(0,40), edited:m.edited,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3)};
  }, CH);
  out.resp = resp;
  return out;
};
