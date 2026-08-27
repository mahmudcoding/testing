const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  // attachment in a DM
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-m1.png`);
  await page.waitForTimeout(5500);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.type('QA-S2-DMATT');
  await page.waitForTimeout(600);
  await page.locator('button[aria-label="Send"]').last().click({timeout:8000});
  await page.waitForTimeout(6500);
  out.attachment = await page.evaluate(async (dm)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {body:m.body, files:(m.files||[]).map(f=>f.filename),
      imgs: el? el.querySelectorAll('img').length:0,
      text: el? el.innerText.replace(/\n+/g,' | ').slice(0,70):null,
      buttons: el? [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,4):null};
  }, DM);
  // reaction in a DM
  const row = page.locator('[data-message-id]').last();
  await row.hover(); await page.waitForTimeout(900);
  await row.locator('button[aria-label="Add reaction"]').first().click({timeout:10000});
  await page.waitForTimeout(1800);
  try { await page.locator('input[aria-label="Search emoji"]').last().fill('fire'); await page.waitForTimeout(1200);
        await page.locator('button[aria-label="Fire"]').last().click({timeout:8000}); } catch(e){ out.reactErr=String(e).slice(0,70); }
  await page.waitForTimeout(2500);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  out.reaction = await page.evaluate(async (dm)=>{
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {apiReactions: JSON.stringify(m.reactions||[]).slice(0,110),
      domText: el? el.innerText.replace(/\n+/g,' | ').slice(0,80):null};
  }, DM);
  return out;
};
