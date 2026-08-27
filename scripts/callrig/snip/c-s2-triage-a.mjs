export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // ── ALK-3021: status line in the members list starts with a stray slash
  await page.locator('button').filter({hasText:/members/i}).first().click();
  await page.waitForTimeout(2500);
  out.alk3021=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(v)
      .filter(x=>/Members/.test(x.innerText||''))
      .sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
    if(!d) return 'no dialog';
    const leaves=[...d.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
      .map(e=>({t:(e.textContent||''), trimmed:(e.textContent||'').trim()}))
      .filter(x=>/Status|Online|Offline|Away/i.test(x.trimmed));
    return {statusNodes:leaves.slice(0,4),
      startsWithSlash: leaves.some(x=>/^\s*\//.test(x.t)),
      rawFirst: leaves[0]? JSON.stringify(leaves[0].t.slice(0,26)) : null};});
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  // ── ALK-2807: plain composer decodes HTML entities
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  await comp.click(); await comp.type('QA-T1 &amp; &lt;b&gt; &quot;q&quot; &#65;',{delay:30});
  await page.waitForTimeout(500);
  out.composerBeforeSend=await comp.evaluate(e=>e.innerText.trim().slice(0,50));
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  out.alk2807=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const m=(await r.json()).messages[0];
    const e=document.querySelector(`main [data-message-id="${m.id}"]`);
    return {stored:m.body, rendered:e?(e.innerText||'').replace(/\s+/g,' ').slice(-46):null};}, ch);
  return out;
};
