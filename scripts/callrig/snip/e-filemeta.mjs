export default async ({page}) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/files?workspace_id=W4QEF1XTURESO01&scope=own',{credentials:'include'});
    const j=await r.json();
    const arr=j.files||j.data||[];
    return {total:j.total, keys:arr[0]?Object.keys(arr[0]).join(','):null,
      files:arr.map(f=>JSON.stringify(f).slice(0,320))};
  });
};
