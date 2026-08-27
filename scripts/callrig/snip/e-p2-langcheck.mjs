import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const api = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const b=await r.json();
    return {language: b?.language || b?.user?.language || b?.settings?.language || '(not in /auth/me)'};
  });
  const ui = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const t=m.innerText.replace(/\s+/g,' ');
    return {head:t.slice(0,70), looksEnglish:/People|Channels|Search directories/i.test(t),
      looksRussian:/Люди|Каналы|Поиск/i.test(t)};
  });
  return {api, ui};
};
