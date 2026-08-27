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
  const out={runs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const send=async(file, tag)=>{
    if(!await empty(page, comp)) return {tag, err:'not empty'};
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/${file}`);
    await page.waitForTimeout(3500);
    await comp.click(); await comp.type(tag, {delay:30}); await page.waitForTimeout(300);
    await page.keyboard.press('Enter'); await page.waitForTimeout(8000);
    return page.evaluate((tag)=>{
      const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(x=>new RegExp(tag).test(x.innerText||''));
      if(!e) return {tag, sent:false};
      const inner=window.innerWidth;
      const leaves=[...e.querySelectorAll('*')].filter(x=>x.children.length===0)
        .filter(x=>{const r=x.getBoundingClientRect();return r.width>20;})
        .map(x=>{const cs=getComputedStyle(x); const r=x.getBoundingClientRect();
          return {t:(x.textContent||'').trim().slice(0,60), w:Math.round(r.width),
            right:Math.round(r.right), sw:x.scrollWidth, cw:x.clientWidth,
            ov:cs.textOverflow, ws:cs.whiteSpace};});
      return {tag, sent:true, strong:e.querySelectorAll('strong,b').length,
        em:e.querySelectorAll('em,i').length,
        btnLabels:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
          .filter(l=>l&&/Open|Preview|Download/.test(l)).slice(0,3),
        overflowsRight:leaves.some(l=>l.right>inner),
        docOverflows:document.documentElement.scrollWidth>inner,
        leaves:leaves.slice(-4)};}, tag);
  };
  out.runs.push(await send('qa_s2_**bold**_and_-dash-.txt','QA-S2-FN3'));
  out.runs.push(await send('qa-s2-a-very-long-text-attachment-filename-that-really-ought-to-be-truncated-in-the-row-2026.txt','QA-S2-FN4'));
  await empty(page, comp);
  return out;
};
