export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  return {dms:[...document.querySelectorAll('a[href*="/d/"]')].filter(v)
    .map(a=>({who:(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,28),
              id:(a.getAttribute('href')||'').split('/d/')[1]})).slice(0,8)};
});
