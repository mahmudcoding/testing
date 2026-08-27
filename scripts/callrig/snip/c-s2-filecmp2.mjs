export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const r=await fetch(`/api/v1/users/me/files?workspace_id=${ws}&scope=own`,{credentials:'include'});
  const j=await r.json(); const list=(j&&(j.files||j.items))||[];
  const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
  const W=innerWidth;
  const pane=[...document.querySelectorAll('div,section')].filter(v)
    .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.72&&b.width>250&&b.height>250;})
    .sort((x,y)=>(x.innerText||'').length-(y.innerText||'').length)[0];
  const paneText=pane?(pane.innerText||''):'';
  const inCh=list.filter(f=>f.context_id===ch);
  const names=[...new Set(inCh.map(f=>f.filename).filter(Boolean))];
  const shown=names.filter(n=>paneText.includes(n));
  return {ownTotal:list.length, ownInThisChannel:inCh.length,
    ownNamesHere:names.slice(0,6),
    ownShownInTab:shown.slice(0,6), shownCount:shown.length, missing:names.length-shown.length,
    contextIdsSample:[...new Set(list.map(f=>String(f.context_id).slice(0,10)))].slice(0,4)};
});
