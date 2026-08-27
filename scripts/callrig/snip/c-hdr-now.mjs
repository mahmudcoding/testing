export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const h=document.querySelector('header');
    let srv=null; try{const c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); srv=c.meeting?c.meeting.name:null;}catch(e){}
    return {hdr:(h?h.innerText:'').replace(/\n+/g,' | ').slice(0,90), serverName:srv, url:location.pathname};
  });
};
