export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/files',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const api = await page.evaluate(async()=>{
    const own=await (await fetch('/api/v1/users/me/files?workspace_id=W4QEF1XTURESO01&scope=own',{credentials:'include'})).json();
    const acc=await (await fetch('/api/v1/users/me/files?workspace_id=W4QEF1XTURESO01&scope=accessible',{credentials:'include'})).json();
    return {own:{total:own.total,names:(own.files||[]).map(f=>f.filename)},
            accessible:{total:acc.total,names:(acc.files||[]).map(f=>f.filename)}};
  });
  const ui = await page.evaluate(()=>{const m=document.querySelector('main');
    return (m.innerText.split('Size')[1]||'').replace(/\n{2,}/g,' | ').slice(0,180);});
  return {api, ui};
};
