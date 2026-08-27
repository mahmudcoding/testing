import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const id = process.env.QA_CALL;
  const api = await page.evaluate(async (id) => {
    const g = async (u) => { const r = await fetch(u,{credentials:'include'}); return r.ok? await r.json() : {status:r.status}; };
    return { rooms: await g(`/api/v1/meeting/${id}/breakout-rooms`), me: await g(`/api/v1/meeting/${id}/my-permissions`) };
  }, id);
  const ui = await page.evaluate(() => ({
    inRoom: [...document.querySelectorAll('button')].filter(window.__qa.vis).some(b=>/Leave Side Room/i.test(window.__qa.nameOf(b))),
    header: [...document.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).replace(/\s+/g,' ').slice(0,40)).filter(n=>/Side Room|Main call/.test(n)),
  }));
  return { ui, rooms: (api.rooms.rooms||[]).map(r=>({n:r.name,s:r.status,c:r.participant_count,id:r.id})), role: api.me.role };
};
