export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const badge=document.querySelector('[data-testid="call-recording-badge"]')||[...document.querySelectorAll('[data-testid*="record" i]')][0];
    const j=await (await fetch('/api/v1/meeting/V4OTZWUJP1IN7EQ/recordings',{credentials:'include'})).json().catch(()=>null);
    return {recTestids:[...document.querySelectorAll('[data-testid*="record" i]')].map(e=>({t:e.getAttribute('data-testid'),txt:(e.innerText||'').replace(/\n+/g,'/').slice(0,40)})),
      api: j, bodyRec:(document.body.innerText.match(/.{0,40}record.{0,40}/gi)||[]).slice(0,3)};
  });
};
