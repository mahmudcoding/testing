export default async ({page}) => {
  const tb=await page.$('[data-testid="call-toolbar"]');
  if(!tb) return {err:'no toolbar'};
  for(const b of await tb.$$('button')){ const l=((await b.getAttribute('aria-label'))||'').trim();
    if(l==='More'){ await b.click(); break; } }
  await page.waitForTimeout(3500);
  return await page.evaluate(()=>{
    const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].pop();
    if(!m) return {none:true};
    return {text:m.innerText.replace(/\n+/g,' | ').slice(0,220),
      items:[...m.querySelectorAll('[role="menuitem"],button')]
        .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,28)).filter(Boolean)};});
};
