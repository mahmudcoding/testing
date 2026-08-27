export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const all=[...document.querySelectorAll('button,a')].filter(v);
  return {url:location.pathname,
    pinLike:all.map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim())
               .filter(t=>/pin/i.test(t)),
    topRight:all.filter(b=>b.getBoundingClientRect().top<130 && b.getBoundingClientRect().left>600)
               .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,32))};
});
