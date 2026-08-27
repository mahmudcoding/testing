const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const seen=[];
  const onReq=r=>{ if(r.method()!=='GET') seen.push(r.method()+' '+r.url()); };
  page.on('request', onReq);
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-v3.png`);
  await page.waitForTimeout(5000);
  page.off('request', onReq);
  return {seen: seen.slice(0,6)};
};
