import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const ui = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    return [...new Set([...m.querySelectorAll('button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||''))
      .filter(x=>/^Open .*'s profile$/.test(x))
      .map(x=>x.replace(/^Open (.*)'s profile$/,'$1')))];
  });
  const api = await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return b;};
    const m=await g(`/api/v1/workspaces/${ws}/members`);
    const arr=m?.members||m?.data||[];
    const p=await g(`/api/v1/workspaces/${ws}/presence`);
    return {members:(Array.isArray(arr)?arr:[]).map(x=>x.name||x.display_name||x.user_id),
            presenceCount:(p?.presences||[]).length};
  }, WS);
  const inUiNotApi=ui.filter(x=>!api.members.includes(x));
  const inApiNotUi=api.members.filter(x=>!ui.includes(x));
  return {uiCount:ui.length, apiMembers:api.members.length, presenceCount:api.presenceCount,
    inUiNotApi, inApiNotUi, agree: inUiNotApi.length===0 && inApiNotUi.length===0};
};
