export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/c/C4QEGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const tok = 'zarplex'+Date.now().toString(36);
  const post = await page.evaluate(async(tok)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:'C4QEGENERAL0001', body:'search index probe '+tok})});
    return {s:r.status, b:(await r.text()).slice(0,120)};
  }, tok);
  const tries=[];
  for (const w of [2000,4000,6000]) {
    await page.waitForTimeout(w);
    const t = await page.evaluate(async(tok)=>{
      const r=await fetch(`/api/v1/search?q=${tok}&company_id=O4QEF1XTURESO01&workspace_id=W4QEF1XTURESO01`,{credentials:'include'});
      const j=await r.json().catch(()=>null);
      return {s:r.status, m:j?j.total_messages:null};
    }, tok).catch(e=>({err:String(e).slice(0,60)}));
    tries.push({waited:w, ...t});
  }
  const wide = await page.evaluate(async()=>{
    const r=await fetch(`/api/v1/search?q=probe&company_id=O4QEF1XTURESO01&workspace_id=W4QEF1XTURESO01`,{credentials:'include'});
    const j=await r.json().catch(()=>null);
    return {s:r.status, m:j?j.total_messages:null, u:j?j.total_users:null, c:j?j.total_channels:null};
  }).catch(e=>({err:String(e).slice(0,60)}));
  return {tok, post, tries, wide};
};
