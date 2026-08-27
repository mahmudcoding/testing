export default async ({page}) => {
  const out={};
  const vis = el => true;
  // open "Add to call"
  out.opened = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/^(Add to call|Invite)/i.test(x.getAttribute('aria-label')||x.innerText||''));
    if(b){ b.click(); return (b.getAttribute('aria-label')||b.innerText||'').trim(); } return null;
  });
  await page.waitForTimeout(2500);
  out.panel = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    const scope = d || document.body;
    return {
      text: scope.innerText.replace(/\s+/g,' ').slice(0,600),
      buttons: [...scope.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,25),
      hasGuestWord: /guest/i.test(scope.innerText)
    };
  });
  // also check meeting settings surface
  out.settingsBtn = await page.evaluate(()=>!!document.querySelector('button[aria-label="Meeting settings"]'));
  return out;
};
