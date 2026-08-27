export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{ for(let i=0;i<8;i++){
      if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
      await page.waitForTimeout(250);} return false;};
  const out={cleared:await empty()};
  await comp.click();
  await page.keyboard.type('QA-LINK-a1 docs');
  await page.waitForTimeout(700);
  // select the word "docs"
  for(let i=0;i<4;i++) await page.keyboard.press('Shift+ArrowLeft');
  await page.waitForTimeout(500);
  out.selection=await page.evaluate(()=>String(window.getSelection()));
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,20));},true);});
  let click='no';
  try { await page.locator('button[aria-label="Insert link"]').first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,40); }
  await page.waitForTimeout(3500);
  out.click=click;
  out.landed=await page.evaluate(()=>window.__c);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].filter(v)[0];
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return {dialog: d?{text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,110),
        inputs:[...d.querySelectorAll('input')].filter(v).map(i=>i.getAttribute('placeholder')||'(none)'),
        buttons:[...d.querySelectorAll('button')].filter(v)
          .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,18))}:null,
      composer:c?(c.innerText||'').trim().slice(0,40):null};});
  return out;
};
