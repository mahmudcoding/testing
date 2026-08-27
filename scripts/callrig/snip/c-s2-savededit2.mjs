export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(7000);
  const target=await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')]
      .find(e=>/View original/.test(e.innerText||''));
    return el? el.getAttribute('data-message-id'):null;});
  out.target=target;
  if(!target) return out;
  const snap=()=>page.evaluate((id)=>{
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const el=document.querySelector(`[data-message-id="${id}"]`);
    return {editors:[...document.querySelectorAll('div[contenteditable="true"]')].map(e=>e.getAttribute('aria-label')),
      composer: comp? comp.innerText.slice(0,50):null,
      rowBtns: el? [...el.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>4)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,16)):null,
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')]
        .filter(x=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;})
        .map(x=>x.textContent.trim().slice(0,60)),
      menuOpen: !!document.querySelector('[role="menu"]')};
  }, target);
  const el=page.locator(`[data-message-id="${target}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="More actions"]').first().click({force:true});
  await page.waitForTimeout(700);
  out.before=await snap();
  const ed=page.locator('[role="menu"]').getByText('Edit',{exact:true}).first();
  const box=await ed.boundingBox();
  out.editBox = box? {w:Math.round(box.width), h:Math.round(box.height)}:null;
  await ed.click();
  const s=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(400); s.push(await snap()); }
  out.after=s.at(-1);
  out.menuClosed = s.some(x=>!x.menuOpen);
  out.anyEditorAppeared = s.some(x=>x.editors.length>1);
  out.composerEverFilled = s.some(x=>x.composer && x.composer.trim().length>0);
  out.noticesSeen = [...new Set(s.flatMap(x=>x.notices))];
  return out;
};
