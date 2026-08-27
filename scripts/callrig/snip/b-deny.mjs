export default async ({page}) => {
  const out={};
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/^Deny/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if(b){ b.click(); return (b.getAttribute('aria-label')||b.innerText||'').trim(); } return null;
  });
  await page.waitForTimeout(3000);
  out.hostAfter = await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {
      waitingSection: (t.match(/WAITING.{0,120}/i)||[])[0]||null,
      inCall: (t.match(/\d+ in call/i)||[])[0]||null,
      admitBtns: [...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'')).filter(a=>/admit|deny/i.test(a))
    };
  });
  return out;
};
