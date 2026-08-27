export default async ({ page }) => {
  return await page.evaluate(async (id) => {
    const g = async u => { const r = await fetch(u, {credentials:'include'}); return await r.text(); };
    const m = await g(`/api/v1/meeting/${id}`);
    const s = await g(`/api/v1/meeting/${id}/settings`);
    const pick = (t, keys) => { const o = {}; for (const k of keys) {
      const mm = t.match(new RegExp('"'+k+'":(true|false|"[^"]*"|\\d+)')); if (mm) o[k]=mm[1]; } return o; };
    return { meeting: pick(m, ['name','is_private','password_protected','requires_approval','max_participants','recording_enabled','mute_on_join']),
             settings: pick(s, ['mic_mode','camera_mode','screen_share_mode','chat_enabled','reactions_enabled','mute_on_join','who_can_open_guest_link','guest_link_visibility']) };
  }, process.env.QA_MEETING);
};
