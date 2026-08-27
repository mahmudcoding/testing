export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const mk=async(body)=>page.evaluate(async({ch,body})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body, idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, {ch,body});
  const run=async(item, pattern, tag)=>{
    const id=await mk('QA-S2-FAIL-'+tag);
    await page.waitForTimeout(2500);
    let aborted=0;
    await page.route(pattern, r=>{ aborted++; return r.abort('failed'); });
    const el=page.locator(`[data-message-id="${id}"]`);
    if(!await el.count()){ await page.unroute(pattern); return {tag, err:'not rendered'}; }
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
    let clicked=false;
    const inline=el.locator(`button[aria-label="${item}"]`);
    if(await inline.count()){ await inline.first().click({force:true}); clicked=true; }
    else {
      await el.locator('button[aria-label="More actions"]').first().click({force:true});
      await page.waitForTimeout(700);
      const mi=page.locator('[role="menu"]').getByText(item,{exact:true}).first();
      if(await mi.count()){ await mi.click(); clicked=true; } else await page.keyboard.press('Escape');
    }
    const s=[];
    for(let i=0;i<10;i++){ await page.waitForTimeout(500);
      s.push(await page.evaluate(()=>{
        const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
        return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,54));}));
    }
    await page.unroute(pattern);
    return {tag, item, clicked, aborted, notices:[...new Set(s.flat())]};
  };
  out.pin     = await run('Pin message', '**/pin**', 'PIN');
  out.save    = await run('Save', '**/forward**', 'SAVE');
  out.reactCtl= await run('Add reaction', '**/reactions**', 'REACTCTL');
  return out;
};
