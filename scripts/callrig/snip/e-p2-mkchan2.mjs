import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Add channel"]').click();
  await page.waitForTimeout(2500);
  const dlg=page.locator('[role=dialog]').last();
  await dlg.locator('input[placeholder="project-alpha"]').fill('e-search-control');
  await dlg.locator('input[placeholder="What is this channel about?"]').fill('permanent positive control for global search Channels bucket');
  await page.waitForTimeout(800);
  let created=null;
  const h=async r=>{const rq=r.request();
    if(rq.method()==='POST'&&/\/channels/.test(rq.url())){
      let b=null; try{b=await r.json()}catch{}
      created={status:r.status(), id:b?.id||b?.channel?.id||null, name:b?.name||b?.channel?.name||null};}};
  page.on('response',h);
  await dlg.locator('button[type=submit]').click();
  await page.waitForTimeout(6000);
  page.off('response',h);
  const after=await page.evaluate(()=>({url:location.pathname,
    inSidebar:[...document.querySelectorAll('a')].some(a=>/e-search-control/.test(a.textContent||''))}));
  return {created, after};
};
