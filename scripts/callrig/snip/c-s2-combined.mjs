const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  // 1) edit a message that has reactions
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-EDITREACT'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const row = page.locator('[data-message-id]').last();
  await row.hover(); await page.waitForTimeout(900);
  await row.locator('button[aria-label="Add reaction"]').first().click({timeout:10000});
  await page.waitForTimeout(1800);
  try { await page.locator('input[aria-label="Search emoji"]').last().fill('rocket'); await page.waitForTimeout(1200);
        await page.locator('button[aria-label="Rocket"]').last().click({timeout:8000}); } catch(e){ out.rErr=String(e).slice(0,60); }
  await page.waitForTimeout(2500); await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  out.beforeEdit = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    return {reactions:JSON.stringify(m.reactions||[]).slice(0,90), body:(m.body||'').slice(0,24)};
  }, PRIV);
  await row.hover(); await page.waitForTimeout(800);
  await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Edit$/}).last().click({timeout:8000});
  await page.waitForTimeout(2200);
  await page.keyboard.type('-X'); await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(3500);
  out.afterEdit = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {reactions:JSON.stringify(m.reactions||[]).slice(0,90), body:(m.body||'').slice(0,26), edited:m.edited,
      domText: el? el.innerText.replace(/\n+/g,' | ').slice(0,90):null};
  }, PRIV);
  // 2) pin in a DM
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const drow = page.locator('[data-message-id]').last();
  await drow.hover(); await page.waitForTimeout(900);
  await drow.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1300);
  out.dmMenu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).pop();
    return p? [...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22)).filter(Boolean):null;
  });
  const pin = page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Pin message$/});
  out.pinInDm = await pin.count();
  if (out.pinInDm) { await pin.last().click({timeout:8000}); await page.waitForTimeout(3000);
    out.dmPinBanner = await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
        let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
      return [...document.querySelectorAll('div,span,p,button')].filter(e=>e.children.length===0 && /Pinned message|View all \(/.test(e.textContent||''))
        .map(e=>({t:(e.textContent||'').trim().slice(0,44), vis:vis(e)}));});
  } else { await page.keyboard.press('Escape'); }
  return out;
};
