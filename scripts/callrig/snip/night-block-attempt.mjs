export default async ({page}) => {
  const reqs=[];
  const onResp = async (r) => {
    const u=r.url();
    if(/\/api\/v1\/messaging\/users\/(block|unblock)/.test(u)){
      let body=''; try{ body=(await r.text()).slice(0,220);}catch(e){}
      reqs.push({m:r.request().method(), u:u.replace(/^https:\/\/[^/]+/,''), s:r.status(), body});
    }
  };
  page.on('response', onResp);
  const want = process.env.QA_BTN || 'Block';
  const btns=await page.$$('[role="dialog"] button, aside button');
  let clicked=null, labels=[];
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    labels.push(l); if(l===want && !clicked){ await b.click(); clicked=l; } }
  await page.waitForTimeout(6000);
  const ui = await page.evaluate(()=>({
    toasts:[...document.querySelectorAll('[data-testid*="toast"],[role="status"],[role="alert"]')]
      .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,100)).filter(Boolean),
    panelButtons:(()=>{const ms=[...document.querySelectorAll('[role="dialog"],aside')];const m=ms[ms.length-1];
      return m?[...m.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,20)):[];})()}));
  page.off('response', onResp);
  return {clicked, labelsSeen:labels.slice(0,8), reqs, ui};
};
