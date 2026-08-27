export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&!/\/rum/.test(u)&&r.request().method()!=='GET'){
      let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,60),s:r.status(),
                 post:(r.request().postData()||'').slice(0,140),body:b});}};
  page.on('response',onResp);
  const want=process.env.QA_ITEM;
  const menus=await page.$$('[role="menu"],[data-radix-popper-content-wrapper]');
  const m=menus[menus.length-1];
  let clicked=null;
  if(m){ for(const e of await m.$$('[role="menuitem"],button')){
    const t=(((await e.getAttribute('aria-label'))||(await e.textContent())||'')).trim();
    if(t===want){ await e.click(); clicked=t; break; } } }
  await page.waitForTimeout(6000);
  page.off('response',onResp);
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')]
    .filter(e=>{const r=e.getBoundingClientRect();
      return e.innerText.trim() && !/sr-only/.test((e.className||'').toString()) && r.width>20 && r.height>10;})
    .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,70)));
  return {clicked, reqs, hostToasts:toasts};
};
