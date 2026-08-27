export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const ch=process.env.QA_CH, mid=process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  return page.evaluate(async({ch,mid})=>{
    const pin=await fetch(`/api/v1/messaging/messages/${mid}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({pin:true})});
    const pinBody=(await pin.text()).slice(0,200);
    // read the message back through the normal list endpoint
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.messages||j.items||j.data||[];
    const sample=arr.find(m=>m.is_pinned||m.pinned||m.pinned_at);
    return {pinStatus:pin.status, pinBody,
      listStatus:r.status, listCount:arr.length,
      anyPinnedInLatestPage: sample? {id:sample.id, body:(sample.body||'').slice(0,16)} : null,
      pinFieldsOnFirst: arr[0]? Object.keys(arr[0]).filter(k=>/pin/i.test(k)) : []};
  }, {ch,mid});
};
