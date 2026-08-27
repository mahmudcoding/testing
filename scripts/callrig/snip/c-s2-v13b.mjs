export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const parent=process.env.QA_PARENT;
  const out={parent};
  out.listEntry = await page.evaluate(async({ch,parent})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=40`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===parent);
    return m? {body:m.body, reply_count:m.reply_count ?? null, deleted:m.deleted_at??m.is_deleted??null}:'absent';
  }, {ch,parent});
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  const s=[];
  for(let i=0;i<18;i++){ await page.waitForTimeout(700);
    s.push(await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const right=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
        .filter(e=>e.getBoundingClientRect().x>900).map(e=>(e.textContent||'').trim())
        .filter(t=>/Replies|Could not|Retry|repl/i.test(t)&&t.length<50);
      return {hits:[...new Set(right)],
        retry: !!document.querySelector('button') && [...document.querySelectorAll('button')]
          .some(b=>/^Retry$/.test((b.textContent||'').trim()) && b.getBoundingClientRect().height>4)};
    }));
  }
  out.settled=s.at(-1);
  out.everSeen=[...new Set(s.flatMap(x=>x.hits))];
  out.retrySeen=s.some(x=>x.retry);
  if(out.retrySeen){
    const codes=[];
    const onResp=r=>{ if(/\/thread/.test(r.url())) codes.push(r.status()); };
    page.on('response', onResp);
    const rb=page.locator('button').filter({hasText:/^Retry$/}).first();
    await rb.click(); await page.waitForTimeout(2500);
    await rb.click().catch(()=>{}); await page.waitForTimeout(2500);
    page.off('response', onResp);
    out.retryCodes=codes;
    out.afterRetry=await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      return [...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
        .filter(e=>e.getBoundingClientRect().x>900).map(e=>(e.textContent||'').trim())
        .filter(t=>/Replies|Could not|Retry/i.test(t)&&t.length<50);});
  }
  return out;
};
