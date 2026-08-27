import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const r = await page.evaluate(async (ws) => {
    const g = async u => { const x = await fetch(u,{credentials:'include'}); let b=null; try{b=await x.json()}catch{} return {s:x.status,b}; };
    const me = await g('/api/v1/auth/me');
    const chans = await g(`/api/v1/workspaces/${ws}/channels`);
    const arch = await g('/api/v1/users/me/channels/archived');
    const list = (chans.b?.channels||chans.b?.data||chans.b||[]);
    const names = (Array.isArray(list)?list:[]).map(c=>({id:c.id,name:c.name,arch:c.is_archived??c.archived}));
    const av = (arch.b?.channels||arch.b?.data||arch.b||[]);
    return {
      me: me.b?.user?.username || me.b?.username,
      chanStatus: chans.s, visible: names,
      archStatus: arch.s, archived: (Array.isArray(av)?av:[]).map(c=>({id:c.id,name:c.name}))
    };
  }, WS);
  return r;
};
