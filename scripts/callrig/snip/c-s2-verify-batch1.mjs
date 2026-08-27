const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', priv='C4QCPRIVATE0001';
  const out={};
  // build stamp first — did staging change?
  out.build = await page.evaluate(async()=>{
    const t=await (await fetch('/', {credentials:'include'})).text();
    const m=t.match(/data-dpl-id="([^"]*)"/);
    return m? m[1] : 'not in hydrated fetch';
  });

  // --- BUG-15: Copy text copies the username, not the display name
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await comp.type('@qa_c_bob', {delay:55}); await page.waitForTimeout(1200);
  const o=page.locator('[role="option"]').filter({hasText:'qa_c_bob'});
  if(await o.count()) await o.first().click();
  await page.waitForTimeout(700);
  await comp.type('QA-S2-V15', {delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-V15'}).last();
  out.v15_onScreen = await el.evaluate(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60));
  await page.evaluate(()=>navigator.clipboard.writeText('SENTINEL')).catch(()=>{});
  await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="Copy text"]').first().click();
  await page.waitForTimeout(1500);
  out.v15_clipboard = await page.evaluate(async()=>{ try{ return (await navigator.clipboard.readText()).slice(0,60);}catch(e){return 'ERR';} });

  // --- BUG-8: Send as file toggle changes nothing in the request
  await empty(page, comp);
  const bodies=[];
  await page.route('**/files/upload**', async (route)=>{
    const b=route.request().postDataBuffer();
    const txt=b? b.toString('latin1'):'';
    bodies.push({len:txt.length, hasDisplayMode:/name="display_mode"/.test(txt)});
    await route.continue();
  });
  const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
  const one=async(asFile)=>{
    await empty(page, comp);
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-v1.png`);
    await page.waitForTimeout(3000);
    const tog=page.locator('button[aria-label="Send as file"], button[aria-label="Send as photo"]');
    const before=await tog.count()? await tog.first().getAttribute('aria-label'):'none';
    if(asFile && await tog.count()) { await tog.first().click(); await page.waitForTimeout(900); }
    const after=await tog.count()? await tog.first().getAttribute('aria-label'):'none';
    await comp.click(); await comp.type('QA-S2-V8-'+(asFile?'FILE':'PHOTO'), {delay:30});
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter'); await page.waitForTimeout(7000);
    return {before, after};
  };
  out.v8_photo = await one(false);
  out.v8_file  = await one(true);
  await page.unroute('**/files/upload**');
  out.v8_bodies = bodies;
  return out;
};
