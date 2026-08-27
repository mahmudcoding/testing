const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  return await page.evaluate(async (dm)=>{
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=20`,{credentials:'include'});
    let j=null; try{j=await r.json();}catch(e){}
    const list=(j&&(j.messages||j.data))||[];
    const main=document.querySelector('main')||document.body;
    return {apiStatus:r.status, apiCount:list.length, apiBodies:list.map(m=>m.body).slice(0,8),
      domCount: document.querySelectorAll('[data-message-id]').length,
      domTexts:[...document.querySelectorAll('[data-message-id]')].map(m=>m.innerText.replace(/\n+/g,' ').slice(0,42)).slice(0,8),
      mainText: main.innerText.replace(/\n+/g,' | ').slice(0,200)};
  }, DM);
};
