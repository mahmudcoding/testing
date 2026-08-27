const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  out.sidebar = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28))
      .filter(t=>/add channel|new direct|create|invite/i.test(t));
  });
  // members dialog
  await page.locator('button[aria-label$="members"], button[aria-label$="member"]').last().click({timeout:8000});
  await page.waitForTimeout(2500);
  out.membersDialog = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,220),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26), dis:b.disabled}))}:null;
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  // channel details
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:8000});
  await page.waitForTimeout(2500);
  out.details = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const ins=[...document.querySelectorAll('input,textarea')].filter(vis).map(i=>({v:i.value.slice(0,26), ro:i.readOnly, dis:i.disabled}));
    const btns=[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean).slice(-12);
    return {inputs:ins, tailButtons:btns};
  });
  // own message actions as a guest
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  const mine = page.locator('[data-message-id]').filter({hasText:'QA-S2-GUEST-HELLO'}).last();
  await mine.scrollIntoViewIfNeeded().catch(()=>{});
  await mine.hover(); await page.waitForTimeout(800);
  await mine.locator('button[aria-label="More actions"]').first().click({timeout:8000}).catch(()=>{});
  await page.waitForTimeout(1200);
  out.msgMenu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).pop();
    return p? [...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean):null;
  });
  return out;
};
