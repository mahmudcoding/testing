const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const out={};
  // 1) save a message authored by the OTHER person
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const other = page.locator('[data-message-id]').filter({hasText:'QA-S2-V7-ALL'}).last();
  out.otherText = ((await other.innerText().catch(()=>''))||'').replace(/\n+/g,' | ').slice(0,60);
  await other.scrollIntoViewIfNeeded().catch(()=>{});
  await other.hover(); await page.waitForTimeout(900);
  await other.locator('button[aria-label="Save"]').first().click({timeout:10000});
  await page.waitForTimeout(2500);
  out.channelSideAfterSave = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-V7-ALL/.test(m.innerText||'')).pop();
    return el? [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(Boolean):null;
  });
  // 2) fresh load of the Saved page, exhaustive enumeration
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const row = page.locator('[data-message-id]').filter({hasText:'QA-S2-V7-ALL'}).last();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(900);
  out.savedRow = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-V7-ALL/.test(m.innerText||'')).pop();
    const sel='button,a,[role="button"],[role="menuitem"],input,[tabindex]:not([tabindex="-1"])';
    return el? {text:el.innerText.replace(/\n+/g,' | ').slice(0,120),
      interactive:[...el.querySelectorAll(sel)].filter(vis).map(e=>({tag:e.tagName, label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,26)})).filter(x=>x.label)}:null;
  });
  await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1400);
  out.menu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).pop();
    return p? {items:[...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean),
      text:p.innerText.replace(/\n+/g,' | ').slice(0,200)}:null;
  });
  // hover each menu item in case Unsave hides in a submenu
  const items = page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button');
  const cnt = await items.count();
  const found=[];
  for (let i=0;i<cnt;i++){
    await items.nth(i).hover().catch(()=>{});
    await page.waitForTimeout(400);
    const t = await page.evaluate(()=>/unsave/i.test(document.body.innerText));
    if (t) found.push(i);
  }
  out.unsaveAfterHoveringAllItems = found;
  out.pageHasUnsaveWord = await page.evaluate(()=>/unsave/i.test(document.body.innerText));
  return out;
};
