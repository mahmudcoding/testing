import {BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const j=await r.json(); const u=j.user||j; return {st:r.status, email:u.email, name:u.name, id:u.id};})()`);
};
