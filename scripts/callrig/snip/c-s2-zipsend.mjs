const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const file=process.env.QA_FILE||'qa-s2-bundle.zip';
  const tag=process.env.QA_TAG||'QA-V6-ZIP';
  const out={file,tag};
  await page.goto('about:blank'); await page.waitForTimeout(800);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  const before=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    return (await r.json()).messages[0].channel_seq;}, ch);
  out.seqBefore=before;
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/${file}`);
  await page.waitForTimeout(6000);
  out.composerArea=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const hits=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/Ready to send|B$|KB|Removing|error|failed|not supported|unsupported/i.test(t));
    return [...new Set(hits)].slice(0,6);});
  out.toastsAfterAttach=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60)))];});
  await comp.click(); await comp.type(tag,{delay:35}); await page.waitForTimeout(500);
  const sendBtn=page.locator('button[aria-label="Send"]').first();
  out.sendDisabled=await sendBtn.count()? await sendBtn.isDisabled() : null;
  if(await sendBtn.count() && !out.sendDisabled) await sendBtn.click();
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(14000);
  out.after=await page.evaluate(async({ch,tag})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
    const arr=(await r.json()).messages||[];
    const m=arr[0];
    const e=document.querySelector(`main [data-message-id="${m.id}"]`);
    return {newestSeq:m.channel_seq, newestBody:(m.body||'').slice(0,26),
      files:(m.files||[]).length,
      btns:e?[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
        .filter(b=>b&&/Open|Preview|Download/.test(b)).slice(0,3):null};},{ch,tag});
  out.sent = out.after.newestSeq>before;
  return out;
};
