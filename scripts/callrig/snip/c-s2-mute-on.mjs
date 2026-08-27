export default async ({page}) => {
  const ch=page.url().split('/c/')[1];
  const r=await page.evaluate(async(ch)=>{
    const res=await fetch(`/api/v1/notifications/channels/${ch}/mute`,{method:'POST',credentials:'include'});
    const j=await (await fetch('/api/v1/notifications?limit=3',{credentials:'include'})).json();
    const arr=j.notifications||j.data||j||[];
    return {muteStatus:res.status, total:j.total??arr.length,
      newest:arr.slice(0,2).map(n=>({type:n.type,title:n.title,body:(n.body||'').slice(0,40)}))};
  }, ch);
  return r;
};
