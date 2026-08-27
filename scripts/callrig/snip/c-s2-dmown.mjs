export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return {id:j.id, email:j.email};
  });
  const dmId=page.url().split('/d/')[1];
  out.dmId=dmId;
  out.api = await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'})).json();
    const ms=j.messages||j.data||j||[];
    return ms.slice(0,10).map(m=>({id:m.id, user_id:m.user_id, body:(m.body||'').slice(0,26)}));
  }, dmId);
  out.dom = await page.evaluate(()=>[...document.querySelectorAll('main [data-message-id]')]
    .map((e,i)=>({i, id:e.getAttribute('data-message-id'), txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,34)})));
  return out;
};
