export default async ({page}) => {
  const M=process.env.QA_MEET;
  const r = await page.evaluate(async (M)=>{
    const resp = await fetch('/api/v1/meeting/'+M+'/end',{method:'POST',credentials:'include'});
    return {status: resp.status, body:(await resp.text()).slice(0,150)};
  }, M);
  await page.waitForTimeout(8000);
  return r;
};
