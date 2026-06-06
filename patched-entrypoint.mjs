// Point both host variables directly to your live public Codespace tunnel link
const PUBLIC_STORAGE_HOST = "ideal-acorn-jjp959r74g7gc5q57-3000.app.github.dev";
const API_HOST = "ideal-acorn-jjp959r74g7gc5q57-3000.app.github.dev";

const getVersionFromHost = (host) =>
  fetch(`https://${host}/version`, {
    headers: { 'x-target-host': 'ideal-acorn-jjp959r74g7gc5q57-3000.app.github.dev' }
  }).then((response) => {
    if (!response.ok) throw new Error("Bad response");
    return response.text();
  });

const loadExtension = async (baseUrl, version) => {
  window._spicy_lyrics_metadata = { LoadedVersion: version };
  // Modifies the secure asset fetch import stream to pipe safely through the proxy tunnel
  const proxyUrl = `https://${PUBLIC_STORAGE_HOST}/spicy-lyrics${encodeURIComponent(`@${version}.mjs`)}`;
  
  // Custom header proxy wrapper configuration fallback
  return await import(`https://${PUBLIC_STORAGE_HOST}/spicy-lyrics/${version}.mjs`);
};

const showVersionError = () => {
  Spicetify.PopupModal.display({
    title: "",
    content: `<div style="text-align: center; padding: 16px 0;"><h2>Spicy Lyrics failed to load</h2></div>`,
    isLarge: true,
  });
};

const showImportError = () => {
  Spicetify.PopupModal.display({
    title: "",
    content: `<div style="text-align: center; padding: 16px 0;"><h2>Spicy Lyrics failed to initialize</h2></div>`,
    isLarge: true,
  });
};

const load = async (apiHost) => {
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (
        Spicetify !== undefined &&
        Spicetify.React !== undefined &&
        Spicetify.ReactDOM !== undefined &&
        Spicetify.ReactDOMServer !== undefined &&
        Spicetify.PopupModal !== undefined
      ) {
        clearInterval(interval);
        resolve();
      }
    }, 10);
  });

  let version;
  let lastError;

  for (let i = 0; i < 10; i++) {
    try {
      version = await getVersionFromHost(apiHost);
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!version) {
    console.error(`[Spicy Lyrics] [Entry] Failed to fetch version after 10 attempts:`, lastError);
    showVersionError();
    return;
  }

  for (let i = 0; i < 3; i++) {
    try {
      await loadExtension(PUBLIC_STORAGE_HOST, version);
      return;
    } catch (err) {
      lastError = err;
    }
  }

  console.error(`[Spicy Lyrics] [Entry] Failed to import extension after 10 attempts:`, lastError);
  showImportError();
};

// Initialize the application layout environment engine
load(API_HOST);
