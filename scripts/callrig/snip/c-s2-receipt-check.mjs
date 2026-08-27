export default async ({page}) => {
  const id=process.env.QA_MID;
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
