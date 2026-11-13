/* ==========================================================================
   Maison Soleil — interactions
   1. Mobile navigation
   2. Copy the Wi-Fi password
   3. Print the receipt
   4. Download an .ics calendar file
   ========================================================================== */
(() => {
  "use strict";

  /* ------------------------------------------------------------------------
     1. Mobile navigation
     ---------------------------------------------------------------------- */
  const sidebar = document.querySelector(".sidebar");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navLinks = document.querySelectorAll(".nav__link");

  const setMenu = (open) => {
    if (!sidebar || !menuToggle) return;

    sidebar.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu"
    );
  };

  if (sidebar && menuToggle) {
    menuToggle.addEventListener("click", () => {
      setMenu(!sidebar.classList.contains("is-open"));
    });

    // Close after choosing a destination, so the content is visible.
    navLinks.forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    // If the viewport grows past the breakpoint, reset the menu state.
    const desktop = window.matchMedia("(min-width: 901px)");
    desktop.addEventListener("change", (event) => {
      if (event.matches) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------------
     2. Copy the Wi-Fi password
     ---------------------------------------------------------------------- */
  const copyStatus = document.getElementById("copy-status");

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Permission denied: try the legacy fallback below.
      }
    }

    // Fallback for older browsers, non-secure contexts (file://) or denied
    // clipboard permissions.
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.top = "-9999px";
    document.body.append(helper);
    helper.select();

    const copied = document.execCommand("copy");
    helper.remove();

    if (!copied) throw new Error("Copy command failed");
  };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copy);
      if (!target) return;

      const label = button.querySelector("[data-copy-label]");
      const text = target.textContent.trim();

      try {
        await copyText(text);

        if (label) label.textContent = "Copied";
        if (copyStatus) copyStatus.textContent = "Wi-Fi password copied to clipboard.";

        window.setTimeout(() => {
          if (label) label.textContent = "Copy";
          if (copyStatus) copyStatus.textContent = "";
        }, 2500);
      } catch {
        if (copyStatus) {
          copyStatus.textContent =
            "Couldn't copy automatically. Select the password and copy it manually.";
        }
      }
    });
  });

  /* ------------------------------------------------------------------------
     3. Print the receipt
     ---------------------------------------------------------------------- */
  const printButton = document.querySelector("[data-print]");

  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }

  /* ------------------------------------------------------------------------
     4. Download an .ics file for the stay
     ---------------------------------------------------------------------- */
  const calendarButton = document.querySelector("[data-calendar]");

  if (calendarButton) {
    calendarButton.addEventListener("click", () => {
      const stamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0];

      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Maison Soleil//Booking MS-2026 0421-AH//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "UID:ms-2026-0421-ah@maisonsoleil.example",
        `DTSTAMP:${stamp}Z`,
        "DTSTART:20260425T150000",
        "DTEND:20260429T110000",
        "SUMMARY:Maison Soleil — La Garrigue",
        "LOCATION:12 Rue des Oliviers\\, Cassis\\, France",
        "DESCRIPTION:Booking MS-2026 0421-AH. Check-in from 15:00\\, check-out by 11:00.",
        "END:VEVENT",
        "END:VCALENDAR"
      ];

      const blob = new Blob([lines.join("\r\n")], {
        type: "text/calendar;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "maison-soleil-booking.ics";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }
})();
