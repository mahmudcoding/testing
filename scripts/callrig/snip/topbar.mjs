export default async ({page}) => await page.evaluate(async(mid)=>{
  const tb=document.querySelector('[data-testid="call-top-bar"]');
  const j = await (await fetch(`/api/v1/meeting/${mid}`,{credentials:'include'})).json();
  return {uiTopBar: tb? tb.innerText.replace(/\n+/g,' | ').slice(0,80):null, apiName: j.meeting? j.meeting.name : null};
}, process.env.QA_MID);
