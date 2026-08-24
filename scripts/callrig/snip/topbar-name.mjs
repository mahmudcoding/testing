export default async ({page}) => await page.evaluate(async ()=>{
  const j = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
  return {apiName: j.meeting? j.meeting.name : null,
    top:(document.querySelector('[data-testid="call-top-bar"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,80)};
});
