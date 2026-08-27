export default async ({page}) => {
  await page.goto('https://airion-cargo.store/');
  await page.waitForTimeout(8000);
  return page.evaluate(async ()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {status:r.status, who:j&&(j.email||j.username||j.display_name), id:j&&(j.id||j.user_id),
      url:location.pathname.slice(0,40)};});
};
