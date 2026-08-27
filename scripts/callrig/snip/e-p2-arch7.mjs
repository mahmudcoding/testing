import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws) => {
    const x = await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}&limit=100&offset=0`,{credentials:'include'});
    const b = await x.json();
    const ch = b.channels||b.data||[];
    return {status:x.status, total:b.total??null,
      keysPerChannel: ch.map(c=>({name:c.name, keys:Object.keys(c).sort()})),
      raw: ch.map(c=>JSON.stringify(c))};
  }, WS);
};
