export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const NAME = '   QA C Spaces Test   ';
  const dlg = page.locator('[role=dialog]').last();
  const name = dlg.locator('input[placeholder="project-alpha"]').first();
  await name.fill(''); await page.waitForTimeout(200); await name.type(NAME);
  await page.waitForTimeout(600);
  const reqs=[]; page.on('response', async r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,260);}catch(e){}
    reqs.push({m:r.request().method(), u:r.url().replace(/^https?:\/\/[^/]+/,''), s:r.status(), body:b, sent:(r.request().postData()||'').slice(0,200)});}});
  await dlg.locator('button', {hasText:/^Create$/}).first().click();
  await page.waitForTimeout(4000);
  const after = await page.evaluate(v=>{const vv=eval(v);
    const hdr=[...document.querySelectorAll('button,a')].filter(vv).filter(b=>b.getBoundingClientRect().top<140)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,40)).filter(Boolean);
    const side=[...document.querySelectorAll('a[href*="/c/"]')].filter(vv).map(a=>JSON.stringify(a.innerText.replace(/\n/g,'|'))).slice(0,12);
    return {url:location.pathname, header:hdr.slice(0,7), sidebar:side,
      dialogs:[...document.querySelectorAll('[role=dialog]')].filter(vv).length};}, V);
  return {typedName: JSON.stringify(NAME), posts: reqs, after};
};
