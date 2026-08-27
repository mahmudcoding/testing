import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const myId=me?.id||me?.user?.id;
    const r=await fetch(`/api/v1/workspaces/${ws}/members`,{credentials:'include'});
    const b=await r.json(); const arr=b.members||b.data||[];
    const mine=(Array.isArray(arr)?arr:[]).find(m=>m.user_id===myId);
    return {found:!!mine,
      keys: mine? Object.keys(mine).filter(k=>/status|presence/i.test(k)) : [],
      custom_status: mine? JSON.stringify(mine.custom_status ?? '(no key)') : null,
      presence: mine? JSON.stringify(mine.presence) : null,
      othersWithStatus:(Array.isArray(arr)?arr:[]).filter(m=>m.custom_status).map(m=>m.name||m.user_id)};
  }, WS);
};
