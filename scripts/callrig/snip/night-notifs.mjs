export default async ({page}) => {
  const btns=await page.$$('button');
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim();
    if(/^Notifications/.test(l)){ await b.click(); break; } }
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>{
    const panels=[...document.querySelectorAll('[role="dialog"],aside,[class*="popover"],[data-radix-popper-content-wrapper]')]
      .filter(e=>e.innerText && e.innerText.length>25);
    const p=panels[panels.length-1];
    return p?{text:p.innerText.replace(/\n+/g,' | ').slice(0,420)}:{none:true};
  });
};
