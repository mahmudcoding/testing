export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01';
  const r=await fetch(`/api/v1/users/me/files?workspace_id=${ws}&scope=own`,{credentials:'include'});
  const j=await r.json(); const a=(j&&(j.files||j.items))||[];
  const list=Array.isArray(a)?a:[];
  const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
  const W=innerWidth;
  const pane=[...document.querySelectorAll('div,section')].filter(v)
    .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.72&&b.width>250&&b.height>250;})
    .sort((x,y)=>(x.innerText||'').length-(y.innerText||'').length)[0];
  const paneText=pane?(pane.innerText||''):'';
  const ownNames=list.map(f=>f.name||f.file_name||f.original_name||'').filter(Boolean);
  const shown=ownNames.filter(n=>paneText.includes(n));
  return {ownFileFields:list[0]?Object.keys(list[0]):null,
    ownCount:list.length,
    ownNamesSample:ownNames.slice(0,5),
    ownNamesShownInTab:shown.slice(0,6),
    shownCount:shown.length,
    paneFileCount:(paneText.match(/\b\d+(\.\d+)?\s?(B|KB|MB)\b/g)||[]).length};
});
