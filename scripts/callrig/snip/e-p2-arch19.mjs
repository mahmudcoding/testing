import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const caught=[];
  const h = async r => {
    const u=r.url();
    if(!/\/api\/v1\/search/.test(u)) return;
    let body=null; try{ body = await r.json(); }catch{}
    caught.push({url:u.replace(/https?:\/\/[^/]+/,''), status:r.status(),
      totals: body?Object.fromEntries(Object.entries(body).filter(([k])=>/^total/.test(k))):null,
      channelNames: (body?.channels||[]).map(c=>c.name),
      userNames: (body?.users||[]).map(u=>u.username||u.display_name||u.id)});
  };
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(1500);
  await page.locator('input[placeholder*="Type :in"]').fill('qa-general');
  await page.waitForTimeout(4500);
  page.off('response',h);
  const ui = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return dlg? dlg.innerText.replace(/\s+/g,' ').slice(0,300) : 'NO DIALOG';
  });
  return {requests: caught.map(c=>({...c, url: c.url.replace(/company_id=[^&]*/,'company_id=<CO>').replace(/workspace_id=[^&]*/,'workspace_id=<WS>')})), ui};
};
