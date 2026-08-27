export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const W=innerWidth;
  const tabs=[...document.querySelectorAll('button')].filter(v)
    .filter(e=>e.getBoundingClientRect().left>W*0.7)
    .filter(e=>/^(About|Members|Roles|Files|Pinned)/.test((e.innerText||'').trim()))
    .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,14),
              selected:e.getAttribute('aria-selected'),
              dataState:e.getAttribute('data-state'),
              cls:(e.className||'').toString().slice(0,40)}));
  const pane=[...document.querySelectorAll('div,section,aside')].filter(v)
    .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.7&&b.width>250&&b.height>300;})
    .sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length)[0];
  return {tabs, paneText: pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,400):'NO-PANE'};
});
