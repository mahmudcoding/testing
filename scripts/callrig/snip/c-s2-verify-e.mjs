export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const api=(fn,arg)=>page.evaluate(fn,arg);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // ── #17: server names the field and the limit; the screen does not
  out.f17=await api(async(ch)=>{
    const long=(n)=>'x'.repeat(n);
    const send=async(body)=>{
      const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
      const t=await r.text(); return {status:r.status, body:t.slice(0,190)};};
    const ok=await send({description:long(256)});
    const bad=await send({description:long(257)});
    const badName=await send({name:long(129)});
    await send({description:'throwaway: deep-link to old message'});
    return {topic256:ok, topic257:bad, name129:badName};}, ch);
  out.f17.PASS = out.f17.topic256.status===200 && out.f17.topic257.status===400
    && /max 256/.test(out.f17.topic257.body) && /max 128/.test(out.f17.name129.body||'');
  // ── #12: rename keeps the string verbatim (create slugifies)
  const before=await api(async(ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    const j=await r.json(); return j.name;}, ch);
  out.f12={nameBefore:before};
  out.f12.rename=await api(async(ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name:'Project Alpha Two'})});
    const t=await r.text();
    const g=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    const j=await g.json();
    return {patchStatus:r.status, storedName:j.name, echo:t.slice(0,90)};}, ch);
  await page.reload(); await page.waitForTimeout(8000);
  out.f12.headerShows=await page.evaluate(()=>{
    const m=document.querySelector('main');
    return (m.innerText||'').replace(/\s+/g,' ').slice(0,40);});
  // restore
  out.f12.restore=await api(async({ch,before})=>{
    const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({name:before})});
    const g=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    return {status:r.status, nameNow:(await g.json()).name};},{ch,before});
  out.f12.PASS = out.f12.rename.storedName==='Project Alpha Two';
  return out;
};
