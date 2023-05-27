chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameType !== "outermost_frame") {
    return;
  }

  chrome.storage.local.get(["blockedDeadline", "blockedSites"], (result) => {
    if (!result.blockedDeadline) {
      return;
    }
    if (result.blockedDeadline - Date.now() <= 0) {
      chrome.storage.local.remove(["blockedDeadline"]);
      return;
    }

    const blockedSites = result.blockedSites;
    if (!blockedSites) {
      return;
    }

    try {
      const hostName = new URL(details.url).hostname;
      const hostNameWithoutSubdomain = hostName.split(".").slice(-2).join(".");

      if (
        blockedSites.includes(hostName) ||
        blockedSites.includes(hostNameWithoutSubdomain)
      ) {
        chrome.tabs.update(details.tabId, {
          url: "localhost:3000?url=" + details.url,
        });
      }
    } catch (e) {
      console.log(e);
    }
  });
});
