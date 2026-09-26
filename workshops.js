(() => {
  const section = document.querySelector("#workshops");
  if (!section) return;
  const track = section.querySelector(".workshops-track"),
    previous = section.querySelector("[data-slide=prev]"),
    next = section.querySelector("[data-slide=next]");
  const motion = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth";
  if (track) {
    const update = () => {
      if (previous) previous.disabled = track.scrollLeft <= 2;
      if (next)
        next.disabled =
          track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    const slide = (direction) => {
      const card = track.querySelector(".workshop-card");
      track.scrollBy({
        left:
          direction *
          (card.getBoundingClientRect().width +
            parseFloat(getComputedStyle(track).gap)),
        behavior: motion(),
      });
    };
    previous?.addEventListener("click", () => slide(-1));
    next?.addEventListener("click", () => slide(1));
    track.addEventListener("scroll", update, { passive: true });
    new ResizeObserver(update).observe(track);
    update();
    track.addEventListener("keydown", (event) => {
      if (event.target !== track) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        slide(event.key === "ArrowLeft" ? -1 : 1);
      }
    });
  }
  const form = section.querySelector("#workshop-form"),
    button = form.querySelector("[type=submit]"),
    status = form.querySelector(".workshop-form-status");
  const clearErrors = () => {
    form.querySelectorAll(".workshop-field-error").forEach((n) => n.remove());
    form.querySelectorAll("[aria-invalid]").forEach((n) => {
      n.removeAttribute("aria-invalid");
      n.removeAttribute("aria-describedby");
    });
  };
  section.querySelectorAll("[data-workshop-title]").forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (button.dataset.sending) return;
      clearErrors();
      status.textContent = "";
      form.elements.workshop.value = link.dataset.workshopTitle;
      form.elements.when.value = link.dataset.workshopWhen;
      document
        .querySelector("#workshop-request")
        .scrollIntoView({ behavior: motion(), block: "start" });
      form.elements.when.focus({ preventScroll: true });
    }),
  );
  if (form.dataset.preview) return;
  button.disabled = false;
  if (form.dataset.staticPreview) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.textContent =
        "Это просмотр сайта: заявка не отправлена. Отправка заработает после запуска сайта на сервере.";
    });
    return;
  }
  let fingerprint = "",
    token = "";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (button.dataset.sending) return;
    clearErrors();
    status.textContent = "";
    const values = new FormData(form),
      payload = {
        workshop: values.get("workshop"),
        when: values.get("when"),
        people: Number(values.get("people")),
        name: values.get("name"),
        phone: values.get("phone"),
        note: values.get("note"),
        consent: values.get("consent") === "on",
        website: values.get("website"),
      };
    const nextFingerprint = JSON.stringify(payload);
    if (nextFingerprint !== fingerprint) {
      fingerprint = nextFingerprint;
      token = crypto.randomUUID();
    }
    button.dataset.sending = "true";
    button.disabled = true;
    button.textContent = "Отправляем…";
    for (const field of form.querySelectorAll("input,textarea"))
      field.disabled = true;
    let response, result;
    try {
      response = await fetch("/api/workshop-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, token }),
        credentials: "same-origin",
      });
      result = await response.json();
      if (response.ok) {
        form.reset();
        fingerprint = "";
        status.textContent =
          "Заявка получена. Администратор свяжется с вами, чтобы согласовать детали.";
      }
    } catch {
      response = null;
      result = {
        error:
          "Не удалось отправить заявку. Проверьте подключение и попробуйте ещё раз.",
      };
    } finally {
      for (const field of form.querySelectorAll("input,textarea"))
        field.disabled = false;
      delete button.dataset.sending;
      button.disabled = false;
      button.textContent = "Отправить заявку";
    }
    if (!response?.ok) {
      status.textContent =
        result?.error || "Не удалось отправить заявку. Попробуйте позже.";
      const issue = result?.fields?.[0],
        input = issue && form.elements.namedItem(issue.path);
      if (input) {
        const note = document.createElement("span");
        note.className = "workshop-field-error";
        note.id = "workshop-error";
        note.textContent = issue.message;
        input.after(note);
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", note.id);
        input.focus();
      }
    }
  });
})();
