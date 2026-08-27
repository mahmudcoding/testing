export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const comp=()=>page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const empty=async()=>{const c=comp(); for(let i=0;i<8;i++){ if((await c.evaluate(e=>e.innerText.trim()))==='') return true;
    await c.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const newest=()=>page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); return {id:(j.messages||[])[0].id, body:(j.messages||[])[0].body};}, ch);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // ── #20: a fully typed emoticon command swallows the trailing text on Enter
  await empty();
  await comp().type('/shrug QA-V2-TAIL please review',{delay:35}); await page.waitForTimeout(900);
  const before=await newest();
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  out.f20={composerAfterEnter1: await comp().evaluate(e=>e.innerText.trim().slice(0,24)),
    sentAfterEnter1: (await newest()).id!==before.id};
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  const after2=await newest();
  out.f20.sentAfterEnter2 = after2.id!==before.id;
  out.f20.storedBody = after2.body;
  out.f20.PASS = !out.f20.sentAfterEnter1 && out.f20.sentAfterEnter2
                 && !/QA-V2-TAIL/.test(after2.body||'');
  // ── #19: /me picked from the menu is not applied
  await empty();
  await comp().type('/me',{delay:60}); await page.waitForTimeout(1800);
  const item=page.getByText(/Send action message/).first();
  out.f19={menuItemFound: await item.count()};
  if(out.f19.menuItemFound){
    await item.click(); await page.waitForTimeout(1200);
    out.f19.composerAfterPick=await comp().evaluate(e=>e.innerText.trim().slice(0,20));
    await comp().type(' QA-V2-ME waves',{delay:40}); await page.waitForTimeout(600);
    const b=await newest();
    await page.keyboard.press('Enter'); await page.waitForTimeout(4000);
    const a=await newest();
    out.f19.storedBody = a.id!==b.id ? a.body : '(not sent)';
    out.f19.PASS = /^\/me/.test((out.f19.composerAfterPick||'')) && /\/me/.test(out.f19.storedBody||'');
  }
  // control: /shrug picked from the menu IS applied
  await empty();
  await comp().type('/shrug',{delay:60}); await page.waitForTimeout(1800);
  const it2=page.getByText(/Insert shrug emoticon/).first();
  out.controlShrug={menuItemFound: await it2.count()};
  if(out.controlShrug.menuItemFound){
    await it2.click(); await page.waitForTimeout(1200);
    out.controlShrug.composerAfterPick=await comp().evaluate(e=>e.innerText.trim().slice(0,16));
    out.controlShrug.swallowed = !/^\/shrug/.test(out.controlShrug.composerAfterPick||'');
  }
  await empty();
  return out;
};
