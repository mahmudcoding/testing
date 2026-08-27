export default async ({page}) => await page.evaluate(async () => {
  const r=await fetch('/api/v1/channels/C4OXCHJIGRU6EZQ/leave',{method:'POST',credentials:'include'});
  return {leaveStatus:r.status, resp:(await r.text()).slice(0,120)};
});
