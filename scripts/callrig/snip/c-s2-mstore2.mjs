export default async ({page}) => {
  const ch=page.url().split('/c/')[1];
  return page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'})).json();
    return (j.messages||j.data||j||[])
      .map(m=>({body:(m.body||'').slice(0,60), mention_ids:m.mention_ids}))
      .filter(m=>/MANUAL|PICKED|NONMEMBER/.test(m.body.replace(/\\/g,'')));
  }, ch);
};
