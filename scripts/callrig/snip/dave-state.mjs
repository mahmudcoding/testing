export default async ({page}) => {
  return await page.evaluate(async () => {
    const j = async p => { const r = await fetch(p,{credentials:'include'}); try { return await r.json(); } catch(e){ return {status:r.status}; } };
    const h = await j('/api/v1/meetings/history?limit=100');
    const n = await j('/api/v1/notifications?limit=10');
    const m = await j('/api/v1/meeting/V4OTLVMJL42ZGIG');
    return {
      histN: (h.meetings||[]).length,
      hist: (h.meetings||[]).map(x=>x.name+'|'+x.status).slice(0,6),
      notifs: (n.notifications||[]).map(x=>({t:x.title, k:x.title_key, read:x.read, et:x.event_type})),
      meetingStatus: m.meeting ? m.meeting.status : m,
      banner: document.body.innerText.replace(/\n+/g,' | ').slice(0,200)
    };
  });
};
