export default async ({page}) => {
  const ch='C4QCPRIVATE0001', act=process.env.QA_ACT||'archive';
  return page.evaluate(async({ch,act})=>{
    const r=await fetch(`/api/v1/channels/${ch}/${act}`,{method:'POST',credentials:'include'});
    return {act, status:r.status, body:(await r.text()).slice(0,80)};
  }, {ch,act});
};
