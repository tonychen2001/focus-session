window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("url");
  const domainName = new URL(url).hostname;

  if (url) {
    document.querySelector("#navigate-url").textContent = domainName;
    document.querySelector("#navigate-btn").addEventListener("click", () => {
      window.location.href = url;
    });
    document.querySelector("#navigate-section").classList.remove("hidden");
  }
};
