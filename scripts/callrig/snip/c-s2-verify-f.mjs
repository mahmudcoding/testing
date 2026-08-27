export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  return page.evaluate(async(ch)=>{
    const cur=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    const name=cur.name;
    const x=(n)=>'x'.repeat(n);
    const put=async(desc)=>{
      const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({name, description:desc})});
      return {status:r.status, body:(await r.text()).slice(0,180)};};
    const ok=await put(x(256));
    const bad=await put(x(257));
    const longName=await (async()=>{
      const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({name:x(129), description:'restored'})});
      return {status:r.status, body:(await r.text()).slice(0,180)};})();
    await put('throwaway: deep-link to old message');
    const back=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    return {topic256:ok, topic257:bad, name129:longName,
      nameNow:back.name, descNow:(back.description||'').slice(0,40),
      PASS: ok.status===200 && bad.status===400 && /max 256/.test(bad.body)
            && longName.status===400 && /max 128/.test(longName.body)};
  }, ch);
};
