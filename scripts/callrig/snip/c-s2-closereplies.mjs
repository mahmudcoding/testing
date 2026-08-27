export default async ({page}) => {
  const out={};
  out.before=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {url:location.pathname+location.search,
      composers:[...document.querySelectorAll('div[contenteditable="true"]')].filter(v).length};});
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,24));},true);});
  await page.locator('button[aria-label="Close replies"]').first().click({timeout:6000}).catch(e=>{out.err=String(e.message).slice(0,40);});
  await page.waitForTimeout(4000);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {landed:window.__c, url:location.pathname+location.search,
      composers:[...document.querySelectorAll('div[contenteditable="true"]')].filter(v).length,
      closeStillThere:!!document.querySelector('button[aria-label="Close replies"]')};});
  // reopen via the indicator and close with Escape
  const ind=page.locator('button,a').filter({hasText:/repl/i}).first();
  if(await ind.count()){
    await ind.click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(3500);
    out.afterReopen=await page.evaluate(()=>location.pathname+location.search);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2500);
    out.afterEscape=await page.evaluate(()=>({url:location.pathname+location.search,
      composers:[...document.querySelectorAll('div[contenteditable="true"]')]
        .filter(e=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;}).length}));
  }
  return out;
};
