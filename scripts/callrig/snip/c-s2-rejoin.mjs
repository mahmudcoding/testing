const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=channels`,{waitUntil:'load'});
  await page.waitForTimeout(6500);
  const out={};
  const join = page.locator('main button').filter({hasText:/^Join$/});
  const rows = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return m.innerText.replace(/\n+/g,' | ').slice(0,240);
  });
  out.before = rows;
  // find the qa-general row's Join
  const cnt = await join.count();
  for (let i=0;i<cnt;i++){
    const near = await join.nth(i).evaluate(b=>{
      let p=b; for(let k=0;k<4&&p;k++) p=p.parentElement;
      return p? p.innerText.slice(0,60):'';
    });
    if (/qa-general/.test(near)) { await join.nth(i).click({timeout:8000}); out.clicked=i; break; }
  }
  await page.waitForTimeout(4000);
  out.after = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    return {url:location.href, api:r.status};
  }, GEN);
  return out;
};
