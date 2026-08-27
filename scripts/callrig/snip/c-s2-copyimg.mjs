const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page, ctx}) => {
  await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}).catch(()=>{});
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  const img = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('[data-message-id]')].filter(e=>e.querySelector('img'));
    return els.length? els[els.length-1].getAttribute('data-message-id') : null;
  });
  out.imgMsg = img;
  if (!img) return out;
  const row = page.locator(`[data-message-id="${img}"]`).first();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(900);
  await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1300);
  out.menu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).pop();
    return p? [...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22)).filter(Boolean):null;
  });
  const ci = page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Copy image$/});
  out.copyImagePresent = await ci.count();
  if (out.copyImagePresent) {
    await ci.last().click({timeout:8000}); await page.waitForTimeout(2500);
    out.result = await page.evaluate(async ()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      let clip=null;
      try { const items = await navigator.clipboard.read();
        clip = items.map(i=>i.types.join(',')); } catch(e){ clip='ERR:'+String(e).slice(0,60); }
      return {clipboardTypes:clip,
        toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3)};
    });
  }
  return out;
};
