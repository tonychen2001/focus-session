let blockedDeadline = null;
let blockedSites = [];

function clearBlockedDeadline() {
  blockedDeadline = null;
  chrome.storage.local.remove(["blockedDeadline"]);
}

function createBlockListElem(url) {
  const newElem = document.createElement("div");
  newElem.classList.add("blocked-site", "row");
  newElem.innerHTML = `
    <div class="col-8">${url}</div>
    <div class="col-auto">
      <button class="unblock-button">Remove</button>
    </div>
    `;

  newElem.querySelector(".unblock-button").addEventListener("click", () => {
    blockedSites = blockedSites.filter((site) => site !== url);
    chrome.storage.local.set({ blockedSites });
    newElem.remove();
  });

  return newElem;
}

function renderBlockedTimeRemaining() {
  const blockedTimeRemaining = document.querySelector("#time-remaining");

  if (!blockedDeadline) {
    blockedTimeRemaining.innerHTML = "0";
    document.querySelector("#block-start-stop-button").innerHTML = "Start";
    return;
  }

  const timeRemaining = blockedDeadline - Date.now();
  if (timeRemaining <= 0) {
    clearBlockedDeadline();
    blockedTimeRemaining.innerHTML = "0";
    document.querySelector("#block-start-stop-button").innerHTML = "Start";
    return;
  }

  document.querySelector("#block-start-stop-button").innerHTML = "Stop";

  const minutesRemaining = Math.ceil(timeRemaining / 60000);
  blockedTimeRemaining.innerHTML = minutesRemaining;
}

function renderBlockedList() {
  const blockList = document.querySelector("#block-list");
  blockList.innerHTML = "";
  blockedSites.forEach((url) => {
    const blockedSite = createBlockListElem(url);
    blockList.appendChild(blockedSite);
  });
}

function startFocusSession() {
  const minutes = document.querySelector("#block-time-input").value || 90;
  blockedDeadline = Date.now() + minutes * 60000;
  chrome.storage.local.set({ blockedDeadline });
  renderBlockedTimeRemaining();
}

window.onload = function () {
  chrome.storage.local.get(
    ["blockTimeMinutes", "blockedDeadline", "blockedSites"],
    (data) => {
      document.querySelector("#block-time-input").value =
        data.blockTimeMinutes || 90;

      blockedDeadline = data.blockedDeadline || null;
      renderBlockedTimeRemaining();

      blockedSites = data.blockedSites || [];
      renderBlockedList();

      if (!blockedDeadline) {
        startFocusSession();
      }
    }
  );

  document.querySelector("#block-time-input").addEventListener("change", () => {
    const blockTimeMinutes =
      document.querySelector("#block-time-input").value || 90;
    chrome.storage.local.set({ blockTimeMinutes });
  });

  document
    .querySelector("#block-start-stop-button")
    .addEventListener("click", () => {
      if (blockedDeadline) {
        clearBlockedDeadline();
        renderBlockedTimeRemaining();
        return;
      }

      startFocusSession();
    });

  document.querySelector("#block-site-form").addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const url = new URL(document.querySelector("#block-site-input").value);
      const hostname = url.hostname;
      blockedSites.unshift(hostname);

      renderBlockedList();
    } catch (e) {
      const url = document.querySelector("#block-site-input").value;
      blockedSites.unshift(url);
    }
    chrome.storage.local.set({ blockedSites });
    renderBlockedList();
    e.target.reset();
  });

  setInterval(() => {
    renderBlockedTimeRemaining();
  }, 60000);
};
