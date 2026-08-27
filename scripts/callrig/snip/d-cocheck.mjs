export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(async(a)=>{
    const r = await fetch(`/api/v1/companies/${a.CO}`,{credentials:'include'});
    let name=null; try{const j=await r.json(); name=j.name||j.data?.name;}catch(e){}
    const field = document.querySelector('main input:not([placeholder="Filter settings"])')?.value;
    return {apiStatus:r.status, companyNameOnServer:name, fieldShows:field};
  },{CO});
};
