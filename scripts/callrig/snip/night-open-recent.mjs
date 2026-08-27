export default async ({page}) => {
  const btns=await page.$$('main button');
  let clicked=null;
  for(const b of btns){ const t=((await b.innerText())||'').replace(/\s+/g,' ').trim();
    if(/^Team meeting/.test(t)){ await b.click(); clicked=t.slice(0,40); break; } }
  await page.waitForTimeout(6000);
  return {clicked, panel: await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"],aside')].pop();
    return d?{text:d.innerText.replace(/\n+/g,' | ').slice(0,300),
      buttons:[...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26))}:null;})};
};
