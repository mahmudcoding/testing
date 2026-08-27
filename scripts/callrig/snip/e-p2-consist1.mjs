import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // capture the app's own company_id
  let co=null;
  const h=r=>{const u=r.url(); const m=u.match(/company_id=([^&]*)/); if(m&&!co) co=m[1];};
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(1800);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('txt',{delay:40});
  await page.waitForTimeout(3500);
  page.off('response',h);
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  return await page.evaluate(async ({ws,co})=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return b;};
    const filesResp=await g(`/api/v1/users/me/files?workspace_id=${ws}`);
    const files=(filesResp?.files||filesResp?.data||[]).map(f=>f.name||f.filename);
    // search each file by its exact name and see whether search knows it
    const missing=[], found=[];
    for(const n of files){
      const r=await g(`/api/v1/search?q=${encodeURIComponent(n)}&company_id=${co}&workspace_id=${ws}&limit=25`);
      const hit=(r?.files||[]).some(f=>(f.name||f.filename)===n);
      (hit?found:missing).push(n);
    }
    return {companyId: co? 'from the app':'MISSING',
      filesInBrowser: files.length, foundBySearch: found.length,
      missingFromSearch: missing.slice(0,8)};
  }, {ws:WS, co});
};
