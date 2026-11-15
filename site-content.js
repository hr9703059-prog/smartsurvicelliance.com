
async function loadWebsiteContent() {
  const { data, error } = await supabaseClient
    .from("site_content")
    .select("value")
    .eq("key", "site_settings")
    .maybeSingle();

  if (error || !data) return;

  let settings;

  try {
    settings = JSON.parse(data.value);
  } catch {
    return;
  }

  document.querySelectorAll("[data-content]").forEach(element => {
    const key = element.dataset.content;

    if (typeof settings[key] === "string") {
      element.textContent = settings[key];
    }
  });

  document.querySelectorAll("[data-image]").forEach(element => {
    const key = element.dataset.image;

    if (typeof settings[key] === "string" && settings[key]) {
      element.src = settings[key];
    }
  });
}

loadWebsiteContent();
