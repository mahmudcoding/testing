export default async ({page}) => await page.evaluate(()=>{
  const raw = localStorage.getItem('aloqa-call-device-prefs');
  let parsed=null; try{ parsed=JSON.parse(raw); }catch(e){}
  return {raw: (raw||'').slice(0,300), state: parsed && parsed.state ? parsed.state : null};
});
