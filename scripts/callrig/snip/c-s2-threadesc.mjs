export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', pid='M4OXHFFQLR4V3N0';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${pid}`);
  await page.waitForTimeout(13000);
  const st=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const a=document.activeElement;
    return {url:location.search, composers:[...document.querySelectorAll('div[contenteditable="true"]')].filter(v).length,
      focus:a?`${a.tagName}${a.getAttribute('aria-label')?':'+a.getAttribute('aria-label').slice(0,20):''}`:'none'};});
  const out={open:await st()};
  // 1) focus a message in the thread pane (not the composer)
  await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const m=[...document.querySelectorAll('[data-message-id]')].filter(v)
      .find(e=>e.getBoundingClientRect().left>W*0.62);
    if(m){ m.setAttribute('tabindex','-1'); m.focus(); }});
  await page.waitForTimeout(1200);
  out.beforeEscape=await st();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(3000);
  out.afterEscape1=await st();
  // 2) focus the body itself
  await page.evaluate(()=>document.body.focus());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(3000);
  out.afterEscape2=await st();
  // 3) focus the Close replies button, then Escape
  await page.locator('button[aria-label="Close replies"]').first().focus().catch(()=>{});
  await page.keyboard.press('Escape');
  await page.waitForTimeout(3000);
  out.afterEscape3=await st();
  return out;
};
