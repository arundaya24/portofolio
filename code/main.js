document.documentElement.classList.add("js");

      const CONFIG = {
        projects: [
          {
            title: "Pengaduan dan Aspirasi Masyarakat",
            type: "web",
            pattern: 1,
            image: "",
            desc: "Website tempat masyarakat menyampaikan pengaduan dan aspirasi.",
            tags: ["Web", "Layanan publik"],
          },
          {
            title: "AI Berbasis Deep Learning",
            type: "Web",
            pattern: 2,
            image: "",
            desc: "AI dengan deep learning untuk mengenali gambar.",
            tags: ["VB.NET", "Desktop"],
          },
          {
            title: "Aplikasi Mobile Flutter",
            type: "Aplikasi",
            pattern: 2,
            image: "",
            desc: "Desain antarmuka untuk aplikasi dan website.",
            tags: ["UI/UX", "Desain"],
          },
          {
            title: "Pelaporan Kerusakan Jalan",
            type: "web",
            pattern: 0,
            image: "assets/aspara.png",
            desc: "Website untuk melaporkan kerusakan jalan agar laporan dapat dikumpulkan dan ditindaklanjuti.",
            tags: ["Web", "Pelaporan"],
          },
          {
            title: "Penyiraman Tanaman Otomatis",
            type: "iot",
            pattern: 0,
            image: "",
            desc: "Sistem penyiraman tanaman otomatis berbasis IoT.",
            tags: ["IoT", "Embedded"],
          },
          {
            title: "Cybernetic Note Glove",
            type: "hardware",
            pattern: 1,
            image: "",
            desc: "Perangkat sarung tangan untuk mencatat, dibangun di atas Arduino Uno.",
            tags: ["Arduino Uno", "Embedded"],
          },
          {
            title: "Laporan Pendakian Gunung",
            type: "aplikasi",
            pattern: 3,
            image: "",
            desc: "Aplikasi untuk mencatat dan melaporkan kegiatan pendakian gunung.",
            tags: ["Aplikasi"],
          },
        ],
        principles: [
          {
            quote: "Use AI as your tool, not as your brain.",
            note: "AI membantu proses pengembangan. Memahami masalah dan menilai hasilnya tetap tanggung jawab developer.",
          },
          {
            quote:
              "Code is only one part of engineering. Understanding the problem is where everything begins.",
            note: "Alur sistem dan hubungan antar-komponen dipikirkan sebelum implementasi.",
          },
          {
            quote:
              "Technology should solve real problems, not just look impressive.",
            note: "Proyek dipilih karena fungsinya, bukan sekadar mengisi portofolio.",
          },
        ],
        focus: [
          "Software Engineering",
          "Full Stack Web Development",
          "Backend Development",
          "System Design",
          "IoT dan Embedded Systems",
        ],
        contact: { email: "", links: [] },
      };

      const reducedMotion = matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const finePointer = matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;
      const byId = (id) => document.getElementById(id);
      const escapeHtml = (text) =>
        String(text).replace(
          /[&<>"]/g,
          (ch) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch],
        );

      const coverMarkup = (project, index) =>
        `<div class="cover pat${(project.pattern ?? index) % 4}" data-cover="${index}"><span class="tag mono">${escapeHtml(project.type || "proyek")}</span></div>`;

      const renderProjects = () => {
        byId("count").textContent = CONFIG.projects.length;
        byId("projects").innerHTML = CONFIG.projects
          .map(
            (project, index) => `
    <article class="project${index === 0 ? " on" : ""}" tabindex="0" data-index="${index}" data-reveal>
      <span class="type mono">${escapeHtml(project.type || "proyek")}</span>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.desc || "")}</p>
      <div class="tags">${(project.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="m-cover">${coverMarkup(project, index)}</div>
    </article>`,
          )
          .join("");
        byId("preview").innerHTML = CONFIG.projects
          .map((project, index) =>
            coverMarkup(project, index).replace(
              'class="cover',
              `class="cover${index === 0 ? " on" : ""}`,
            ),
          )
          .join("");
      };

      const loadCoverImages = () => {
        CONFIG.projects.forEach((project, index) => {
          if (!project.image) return;
          const image = new Image();
          image.alt = project.title;
          image.onload = () => {
            document
              .querySelectorAll(`[data-cover="${index}"]`)
              .forEach((cover) => {
                cover.classList.add("has-img");
                cover.prepend(image.cloneNode());
              });
          };
          image.src = project.image;
        });
      };

      const bindPreview = () => {
        const rows = [...document.querySelectorAll(".project")];
        const covers = [...byId("preview").children];
        const activate = (index) => {
          rows.forEach((row, i) => row.classList.toggle("on", i === index));
          covers.forEach((cover, i) =>
            cover.classList.toggle("on", i === index),
          );
        };
        rows.forEach((row, index) => {
          row.addEventListener("pointerenter", () => activate(index));
          row.addEventListener("focus", () => activate(index));
        });
      };

      const renderPrinciples = () => {
        byId("principles").innerHTML = CONFIG.principles
          .map(
            (item) => `
    <div class="principle" data-reveal><q>${escapeHtml(item.quote)}</q><p>${escapeHtml(item.note)}</p></div>`,
          )
          .join("");
      };

      const renderFocus = () => {
        byId("focus").innerHTML = CONFIG.focus
          .map(
            (name) => `
    <div class="focus-row" data-reveal><span>${escapeHtml(name)}</span><span class="mono">dalam pengembangan</span></div>`,
          )
          .join("");
      };

      const renderContact = () => {
        const { email, links } = CONFIG.contact;
        const items = [];
        if (email)
          items.push(
            `<div class="mag" data-magnetic><a class="btn btn-primary" href="mailto:${escapeHtml(email)}">Kirim email</a></div>`,
          );
        links
          .filter((link) => link.href)
          .forEach((link) =>
            items.push(
              `<a class="btn" href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`,
            ),
          );
        byId("contact").innerHTML = items.join("");
      };

      const bindReveal = () => {
        const targets = [...document.querySelectorAll("[data-reveal]")];
        if (reducedMotion || !("IntersectionObserver" in window)) {
          targets.forEach((target) => target.classList.add("in"));
          return;
        }
        const observer = new IntersectionObserver(
          (entries) => {
            entries
              .filter((entry) => entry.isIntersecting)
              .forEach((entry, order) => {
                if (!entry.target.style.getPropertyValue("--d"))
                  entry.target.style.setProperty(
                    "--d",
                    `${Math.min(order, 4) * 60}ms`,
                  );
                entry.target.classList.add("in");
                observer.unobserve(entry.target);
              });
          },
          { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
        );
        targets.forEach((target) => observer.observe(target));
      };

      const bindMagnetic = () => {
        if (reducedMotion || !finePointer) return;
        document.querySelectorAll("[data-magnetic]").forEach((host) => {
          const state = { x: 0, y: 0, targetX: 0, targetY: 0, running: false };
          const step = () => {
            state.x += (state.targetX - state.x) * 0.16;
            state.y += (state.targetY - state.y) * 0.16;
            host.style.setProperty("--mx", `${state.x.toFixed(2)}px`);
            host.style.setProperty("--my", `${state.y.toFixed(2)}px`);
            const settled =
              Math.abs(state.targetX - state.x) < 0.05 &&
              Math.abs(state.targetY - state.y) < 0.05;
            if (settled) {
              state.running = false;
              return;
            }
            requestAnimationFrame(step);
          };
          const run = () => {
            if (!state.running) {
              state.running = true;
              requestAnimationFrame(step);
            }
          };
          host.addEventListener("pointermove", (event) => {
            const rect = host.getBoundingClientRect();
            state.targetX = (event.clientX - rect.left - rect.width / 2) * 0.28;
            state.targetY = (event.clientY - rect.top - rect.height / 2) * 0.28;
            run();
          });
          host.addEventListener("pointerleave", () => {
            state.targetX = 0;
            state.targetY = 0;
            run();
          });
        });
      };

      const bindProgress = () => {
        const bar = byId("progress");
        let queued = false;
        const update = () => {
          const max = document.documentElement.scrollHeight - innerHeight;
          bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
          queued = false;
        };
        addEventListener(
          "scroll",
          () => {
            if (!queued) {
              queued = true;
              requestAnimationFrame(update);
            }
          },
          { passive: true },
        );
        update();
      };

      const init = () => {
        renderProjects();
        renderPrinciples();
        renderFocus();
        renderContact();
        loadCoverImages();
        bindPreview();
        bindReveal();
        bindMagnetic();
        bindProgress();
      };

      init();