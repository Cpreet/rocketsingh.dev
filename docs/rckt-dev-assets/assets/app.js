const samples = [
      "My printer won't connect to my laptop...",
      "What am I supposed to fill in this form?",
      "Am I eligible for this programme?",
      "I need to move my domain without breaking email...",
      "Can you turn this spreadsheet into something useful?"
    ];

    const textarea = document.getElementById("question");
    let sampleIndex = 0;

    setInterval(() => {
      if (document.activeElement !== textarea && !textarea.value) {
        sampleIndex = (sampleIndex + 1) % samples.length;
        textarea.placeholder = samples[sampleIndex];
      }
    }, 2800);

    function toast(message) {
      const el = document.getElementById("toast");
      el.textContent = message;
      el.classList.add("show");
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
    }

    function fakeAttach(type) {
      toast(type + " upload would open here.");
    }

    function submitAsk(event) {
      event.preventDefault();
      const value = textarea.value.trim();
      if (!value) {
        textarea.focus();
        toast("Tell the desk what you're trying to get done.");
        return false;
      }
      toast("Got it — this is where rckt would open a case.");
      return false;
    }

    const checks = [...document.querySelectorAll(".recipe-check")];
    const bar = document.getElementById("progressBar");
    const label = document.getElementById("progressLabel");

    function updateProgress() {
      const done = checks.filter(c => c.checked).length;
      bar.style.width = ((done / checks.length) * 100) + "%";
      label.textContent = `${done} of ${checks.length} steps complete`;
      if (done === checks.length) toast("Done. That is the feeling rckt should optimize for.");
    }

    checks.forEach(c => c.addEventListener("change", updateProgress));
