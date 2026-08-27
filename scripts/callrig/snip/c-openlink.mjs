export default async ({page}) => {
  await page.goto(process.env.QA_URL, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const vis=e=>{let a=e,op=1;while(a){const cs=getComputedStyle(a);op=Math.min(op,parseFloat(cs.opacity));if(cs.display==='none'||cs.visibility==='hidden')return false;a=a.parentElement;}return op>0.05&&e.getClientRects().length>0;};
    const txt=(document.body.innerText||'').replace(/\n+/g,' | ').trim();
    return {url:location.pathname, text:txt, textLen:txt.length,
      buttons:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()),
      links:[...document.querySelectorAll('a')].filter(vis).map(a=>(a.textContent||'').trim()+' -> '+a.getAttribute('href'))};
  });
};
