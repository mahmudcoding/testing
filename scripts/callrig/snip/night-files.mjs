export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/files',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(async ()=>{
    const m=document.querySelector('main');
    const api=await (await fetch('/api/v1/users/me/files?workspace_id=W4QAF1XTURESO01&scope=own',{credentials:'include'})).json().catch(e=>({err:String(e)}));
    return {
      main:(m?m.innerText:'').replace(/\n+/g,' | ').slice(0,500),
      tabs:[...document.querySelectorAll('[role="tab"],main button')].map(b=>(b.textContent||'').trim()).filter(Boolean).slice(0,14),
      apiCount:(api.files||[]).length,
      apiSample:(api.files||[]).slice(0,4).map(f=>({name:f.name||f.file_name, type:f.mime_type||f.content_type, size:f.size}))
    };
  });
};
