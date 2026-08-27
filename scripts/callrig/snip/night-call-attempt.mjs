export default async ({page}) => {
  const reqs=[];
  const onResp = async (r) => {
    const u=r.url();
    if(/\/api\/v1\/(messaging\/dm|meeting)\b/.test(u)){
      let body=''; try{ body=(await r.text()).slice(0,200);}catch(e){}
      reqs.push({m:r.request().method(), u:u.replace(/^https:\/\/[^/]+/,''), s:r.status(), body});
    }
  };
  page.on('response', onResp);
  const btns=await page.$$('[role="dialog"] button, aside button');
  let clicked=null;
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(l==='Call'){ await b.click(); clicked=l; break; } }
  await page.waitForTimeout(8000);
  const ui = await page.evaluate(()=>({
    toasts:[...document.querySelectorAll('[data-testid*="toast"],[role="status"],[role="alert"]')]
      .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,90)).filter(Boolean),
    inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
    main:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,110)}));
  page.off('response', onResp);
  return {clicked, reqs, ui};
};
