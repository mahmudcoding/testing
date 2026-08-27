export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'&&!/\/rum/.test(u)){
      let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,54),s:r.status(),body:b});}};
  page.on('response',onResp);
  const d=[...await page.$$('[role="dialog"]')].pop();
  if(!d) return {err:'no dialog'};
  const inp=await d.$('input');
  if(inp){ await inp.fill(process.env.QA_PWD||''); }
  await page.waitForTimeout(800);
  for(const b of await d.$$('button')){ const t=((await b.textContent())||'').trim();
    if(/^Join call$/.test(t)){ await b.click(); break; } }
  await page.waitForTimeout(6000);
  page.off('response',onResp);
  return {reqs, after: await page.evaluate(()=>{
    const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
    const vis=[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')]
      .filter(e=>{const r=e.getBoundingClientRect();
        return e.innerText.trim() && !/sr-only/.test((e.className||'').toString()) && r.width>20 && r.height>10;})
      .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,70));
    return {dialogText: dd?dd.innerText.replace(/\n+/g,' | ').slice(0,130):null, toasts:vis,
      inCall: !!document.querySelector('[data-testid="call-toolbar"]')};})};
};
