export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const TAGS=['QA-S2-DELR-54v','QA-S2-DSC-B'];
  await page.goto('about:blank'); await page.waitForTimeout(800);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  return page.evaluate(async({ch,TAGS})=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const joined=els.map(e=>e.innerText||'').join(' ');
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=30`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const bodies=(j.messages||[]).map(m=>m.body||'');
    return TAGS.map(t=>({tag:t,
      visibleToThisAccount: joined.includes(t),
      inApiForThisAccount: bodies.some(b=>b.includes(t))}));
  },{ch,TAGS});
};
