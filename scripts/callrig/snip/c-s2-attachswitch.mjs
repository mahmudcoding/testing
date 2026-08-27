const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', A='C4QCGENERAL0001', B='C4OX0TTLIMVOUBH';
  const out={};
  const composerArea=()=>page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    if(!c) return {none:true};
    let box=c; for(let i=0;i<6 && box.parentElement;i++) box=box.parentElement;
    const t=(box.innerText||'').replace(/\s+/g,' ');
    return {text:t.slice(0,90), hasChip:/Ready to send|\d+ B|KB/.test(t)};});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`);
  await page.waitForTimeout(9000);
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-m3.txt`);
  await page.waitForTimeout(3500);
  out.inA_afterAttach=await composerArea();
  // switch to channel B via the sidebar, like a person would
  const side=page.locator('nav a, aside a').filter({hasText:'qa-c2-deep'}).first();
  out.sidebarFound=await side.count();
  if(out.sidebarFound){ await side.click(); } else { await page.goto(`https://airion-cargo.store/w/${ws}/c/${B}`); }
  await page.waitForTimeout(6000);
  out.inB=await composerArea();
  out.inB_url=page.url().slice(-16);
  // and back to A
  const back=page.locator('nav a, aside a').filter({hasText:'qa-general'}).first();
  if(await back.count()){ await back.click(); } else { await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`); }
  await page.waitForTimeout(6000);
  out.backInA=await composerArea();
  // if the attachment survived in A, send it and confirm where it landed
  if(out.backInA.hasChip){
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
    await comp.click(); await comp.type('QA-S2-ATTSWITCH',{delay:35}); await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); await page.waitForTimeout(7000);
    out.landed=await page.evaluate(async({A,B})=>{
      const look=async(ch)=>{const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,{credentials:'include'});
        const j=await r.json().catch(()=>({}));
        return (j.messages||[]).map(m=>({b:(m.body||'').slice(0,26), files:(m.files||[]).length}));};
      return {A:await look(A), B:await look(B)};},{A,B});
  }
  return out;
};
