export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QDGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const btn = await page.$('button[aria-label="Open workspace menu"]');
  if (btn) { await btn.click().catch(()=>{}); await page.waitForTimeout(1800); }
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=menuitem]')].filter(vis)
      .find(e=>((e.getAttribute('aria-label')||e.innerText||'').trim())==='Create workspace');
    if(!el) return false; el.click(); return true;
  });
  out.clicked = clicked;
  await page.waitForTimeout(4000);
  out.after = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const dlg=document.querySelector('[role=dialog]');
    return { url: location.pathname.slice(0,40),
      dialog: !!dlg,
      scope: dlg? (dlg.innerText||'').replace(/\s+/g,' ').slice(0,220) : t.slice(0,220),
      inputs: [...(dlg||document).querySelectorAll('input')].filter(vis).length,
      buttons: [...(dlg||document).querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,8),
      refusal: /permission|not allowed|denied|access required/i.test(t) };
  });
  return out;
};
