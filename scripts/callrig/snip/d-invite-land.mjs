export default async ({page}) => {
  const url = process.env.D_INVITE;
  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const ctl=[];
    m.querySelectorAll('button,a,[role="button"]').forEach(x=>{
      const r=x.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
      ctl.push({tag:x.tagName.toLowerCase(), l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,36), dis:!!x.disabled});
    });
    return {url:location.pathname+location.search.slice(0,40), text:(m.innerText||'').replace(/\s+/g,' ').slice(0,500), controlCount:ctl.length, controls:ctl.slice(0,15)};
  });
};
