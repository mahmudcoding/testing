export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const r=await page.evaluate(async(ch)=>{
    const res=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({name:'qa-private',description:''})});
    const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    return {status:res.status, name:j.name, desc:j.description};}, ch);
  return r;
};
