export default async ({page}) => {
  const reqs=[];
  page.on('request', r=>{ if (r.url().includes('/api/v1/calendar/meetings') && r.method()==='POST') reqs.push(r.postData()); });
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('calendar/meetings')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.status()} :: ${b}`);}});
  await page.locator('[role="dialog"] button', {hasText:/^Schedule meeting$/}).first().click();
  await page.waitForTimeout(5000);
  return {payload: reqs, net};
};
