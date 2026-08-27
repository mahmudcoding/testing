const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await comp.type('/', {delay:60}); await page.waitForTimeout(1400);
  out.fullMenu = await page.evaluate(()=>[...document.querySelectorAll('[role="option"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,40)));
  await empty(page, comp);
  const probe=async(cmd, tail)=>{
    if(!await empty(page, comp)) return {cmd, err:'not empty'};
    await comp.type(cmd+' '+tail, {delay:40}); await page.waitForTimeout(1300);
    const before=await comp.evaluate(e=>e.innerText);
    await page.keyboard.press('Enter'); await page.waitForTimeout(1600);
    const after=await comp.evaluate(e=>e.innerText);
    await empty(page, comp);
    return {cmd, before, after, tailKept: after.includes(tail)};
  };
  out.shrug     = await probe('/shrug','QA-S2-TAIL1');
  out.tableflip = await probe('/tableflip','QA-S2-TAIL2');
  out.unflip    = await probe('/unflip','QA-S2-TAIL3');
  out.me        = await probe('/me','QA-S2-TAIL4');
  return out;
};
