export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const id=process.env.QA_MID;
  await page.goto('about:blank'); await page.waitForTimeout(800);
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(12000);
  return page.evaluate((id)=>{
    const e=document.querySelector(`main [data-message-id="${id}"]`);
    if(!e) return {found:false};
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {found:true,
      labels:[...e.querySelectorAll('*')].filter(v)
        .map(x=>x.getAttribute('aria-label')||x.getAttribute('title')||'')
        .filter(t=>/sent|read|seen|deliver|прочит/i.test(t)).slice(0,4),
      text:(e.innerText||'').replace(/\s+/g,' ').slice(-40)};}, id);
};
