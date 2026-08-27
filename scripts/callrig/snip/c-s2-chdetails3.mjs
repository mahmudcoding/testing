export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const W=innerWidth;
  const right=[...document.querySelectorAll('button,a,h1,h2,h3,[role="tab"],[role="heading"],label,input,select')]
    .filter(v).filter(e=>e.getBoundingClientRect().left > W*0.62)
    .map(e=>{const r=e.getBoundingClientRect();
      return `${Math.round(r.top)} ${e.tagName.toLowerCase()}: ${(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').replace(/\s+/g,' ').trim().slice(0,34)}`;});
  return {viewportW:W, rightPane:[...new Set(right)].slice(0,26)};
});
