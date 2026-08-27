export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const all=[...document.querySelectorAll('a,button,[role="button"]')].filter(v);
  const hdr=all.find(e=>/^Direct messages$/i.test((e.getAttribute('aria-label')||e.innerText||'').trim()));
  const hy=hdr?hdr.getBoundingClientRect().top:0;
  const rows=all.filter(e=>{const r=e.getBoundingClientRect();
      return r.left<400 && r.top>hy && r.top<hy+400;})
    .map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim())
    .filter(t=>t && t.length<40 && !/^(Direct messages|New direct message|Message requests)$/i.test(t));
  return {sidebarDMs:[...new Set(rows)].slice(0,10)};
});
