const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={bodies:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await page.route('**/files/upload**', async (route)=>{
    const b=route.request().postDataBuffer();
    const txt=b? b.toString('latin1'):'';
    out.bodies.push({len:txt.length, hasDisplayMode:/name="display_mode"/.test(txt),
      parts:(txt.match(/name="([^"]+)"/g)||[]).slice(0,8)});
    await route.continue();
  });
  const one=async(asFile, tag)=>{
    await empty(page, comp);
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-v1.png`);
    await page.waitForTimeout(3000);
    const tog=page.locator('button[aria-label="Send as file"], button[aria-label="Send as photo"]');
    const before=await tog.count()? await tog.first().getAttribute('aria-label'):'none';
    if(asFile && await tog.count()){ await tog.first().click(); await page.waitForTimeout(900); }
    const after=await tog.count()? await tog.first().getAttribute('aria-label'):'none';
    await comp.click(); await comp.type(tag, {delay:30}); await page.waitForTimeout(300);
    await page.keyboard.press('Enter'); await page.waitForTimeout(6500);
    return {before, after};
  };
  out.photo = await one(false,'QA-S2-V8-PHOTO');
  out.file  = await one(true,'QA-S2-V8-FILE');
  await page.unroute('**/files/upload**');
  return out;
};
