export default async ({page}) => {
  const ch=page.url().split('/c/')[1];
  return page.evaluate(async(ch)=>{
    const res=await fetch(`/api/v1/notifications/channels/${ch}/unmute`,{method:'POST',credentials:'include'});
    return {unmuteStatus:res.status};
  }, ch);
};
