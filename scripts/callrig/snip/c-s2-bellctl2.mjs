export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const roles=[...document.querySelectorAll('[role="dialog"],[role="menu"],[role="listbox"],aside,[data-radix-popper-content-wrapper]')]
    .filter(v).map(e=>{const b=e.getBoundingClientRect();
      return {role:e.getAttribute('role')||e.tagName.toLowerCase(),
        size:`${Math.round(b.width)}x${Math.round(b.height)}`, x:Math.round(b.left),
        text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,70)};});
  // any element whose text mentions notifications
  const byText=[...document.querySelectorAll('div,section,aside')].filter(v)
    .filter(e=>/Notifications/i.test((e.innerText||'').slice(0,60)))
    .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length).slice(0,2)
    .map(e=>{const b=e.getBoundingClientRect();
      return {size:`${Math.round(b.width)}x${Math.round(b.height)}`, x:Math.round(b.left),
        buttons:[...new Set([...e.querySelectorAll('button,[role="tab"]')].filter(v)
          .map(x=>(x.getAttribute('aria-label')||x.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,30)))].slice(0,12),
        head:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)};});
  return {popupsByRole:roles.slice(0,4), panelsByText:byText};
});
