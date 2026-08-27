export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  if(!page.url().includes('/c/'+ch)){ await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(6000); }
  const r=await page.evaluate(async(ch)=>{
    const res=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-REACT-TARGET', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    const j=await res.json(); return {status:res.status, id:j.id};
  }, ch);
  return r;
};
