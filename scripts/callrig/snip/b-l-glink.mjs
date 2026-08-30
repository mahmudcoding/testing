export default async ({ page }) => {
  const ID='V4P254XBZ5W3KPN';
  return await page.evaluate(async (id)=>{
    const out={};
    const g=await fetch(`/api/v1/meeting/${id}/guest-links`,{credentials:'include'});
    out.get={status:g.status, body:(await g.text()).slice(0,600)};
    if(g.status!==200){
      const p=await fetch(`/api/v1/meeting/${id}/guest-links`,{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify({})});
      out.post={status:p.status, body:(await p.text()).slice(0,600)};
    }
    return out;
  }, ID);
};
