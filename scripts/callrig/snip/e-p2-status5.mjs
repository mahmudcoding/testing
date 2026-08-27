import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for (let round=1; round<=2; round++){
    await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    await page.locator('[aria-label="6 members"]').first().click();
    await page.waitForTimeout(round===1?3500:9000);   // second round waits much longer
    const rows = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      return [...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
        && /\/ Status: (Online|Offline)/.test(e.textContent||''))
        .map(e=>e.textContent.replace(/\s+/g,' ').trim().slice(0,40));
    });
    const api = await page.evaluate(async (ws)=>{
      const r=await fetch(`/api/v1/workspaces/${ws}/presence`,{credentials:'include'});
      const b=await r.json();
      return (b.presences||[]).map(x=>`${x.user_id.slice(3,8)}:${x.online?'on':'off'}`);
    }, WS);
    out['round'+round]={panelRows:rows, apiPresence:api};
    await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  }
  return out;
};
