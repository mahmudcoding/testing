export default async ({page}) => {
  const id=process.env.QA_EV;
  return await page.evaluate(async (id)=>{
    const r=await fetch(`/api/v1/calendar/meetings/${id}`,{credentials:'include'});
    const t=await r.text();
    return {s:r.status, hasAttendeesKey: /"attendees"/.test(t), attendees: (t.match(/"attendees":(\[[^\]]*\]|null)/)||['(no key)'])[0].slice(0,220)};
  }, id);
};
