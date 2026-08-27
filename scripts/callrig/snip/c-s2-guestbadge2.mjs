export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  // guest row in the members pane
  let host=null;
  for(const e of document.querySelectorAll('*'))
    if(e.children.length===0 && (e.textContent||'').trim()==='QA Guest'){ host=e; break; }
  let rowInfo='guest row not found';
  if(host){
    let n=host;
    for(let i=0;i<4&&n.parentElement;i++){
      n=n.parentElement;
      const t=(n.innerText||'').replace(/\s+/g,' ').trim();
      if(t.length>0 && t.length<60){
        rowInfo={depth:i+1, text:t,
          childTags:[...n.querySelectorAll('*')].filter(v)
            .map(x=>`${x.tagName.toLowerCase()}${x.className?('.'+String(x.className).split(' ')[0]):''}`).slice(0,10),
          titles:[...n.querySelectorAll('[title],[aria-label]')].map(x=>
            (x.getAttribute('title')||x.getAttribute('aria-label')||'').slice(0,24)).filter(Boolean).slice(0,5)};
        break; }
    }
  }
  // compare with a non-guest row
  let other=null;
  for(const e of document.querySelectorAll('*'))
    if(e.children.length===0 && (e.textContent||'').trim()==='QA Bob'){ other=e; break; }
  let otherInfo=null;
  if(other){ let n=other;
    for(let i=0;i<4&&n.parentElement;i++){ n=n.parentElement;
      const t=(n.innerText||'').replace(/\s+/g,' ').trim();
      if(t.length>0 && t.length<60){ otherInfo={depth:i+1, text:t,
        childCount:n.querySelectorAll('*').length}; break; } } }
  return {guestRow:rowInfo, comparisonRow:otherInfo};
});
