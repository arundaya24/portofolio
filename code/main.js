document.documentElement.classList.add("js");

      const CONFIG = {
        projects: [
          {
            title: "Website Pelaporan Kerusakan Jalan",
            type: "Web",
            pattern: 0,
            image: "../assets/aspara.png",
            href: "https://github.com/arundaya24/aspara",
            desc: "Website Laravel untuk melaporkan kerusakan jalan di sejumlah wilayah Kabupaten Bogor.",
            tags: ["Laravel", "Web", "Pelaporan"],
          },
          {
            title: "Website Penyampaian Aspirasi Masyarakat",
            type: "Web",
            pattern: 1,
            image: "../assets/titik-kritis.png",
            href: "https://github.com/arundaya24/titikkritis",
            desc: "Website berbasis Laravel untuk menyampaikan aspirasi masyarakat.",
            tags: ["Laravel", "Web", "Layanan publik"],
          },
          {
            title: "AI Pengenal Gambar Berbasis Deep Learning",
            type: "AI",
            pattern: 2,
            image: "../assets/arun-d.png",
            href: "https://github.com/arundaya24/arun-d",
            desc: "AI berbasis Python yang berjalan di website untuk mengidentifikasi gambar dari pengguna.",
            tags: ["Python", "Deep Learning", "Web"],
          },
          {
            title: "Website Sablon Online",
            type: "Web",
            pattern: 3,
            image: "../assets/inkra.png",
            href: "https://github.com/arundaya24/inkra",
            desc: "Website untuk pemesanan sablon online menggunakan PHP Native",
            tags: ["PHP", "Web", "E-commerce"],
          },
          {
            title: "Aplikasi Mobile Pencatat Tugas Sekolah",
            type: "Mobile",
            pattern: 0,
            image: "../assets/nigas.png",
            href: "https://github.com/arundaya24/nigas",
            desc: "Aplikasi mobile berbasis Dart untuk mencatat tugas sekolah.",
            tags: ["Dart", "Flutter", "Mobile"],
          },
          {
            title: "DayMark",
            type: "Mobile",
            pattern: 1,
            image: "../assets/daymark.png",
            href: "https://github.com/arundaya24/DayMark",
            desc: "Aplikasi jurnal harian berbasis Flutter untuk mencatat refleksi dan mood, melihat konsistensi lewat heatmap, serta membuat ringkasan dan ekspor PDF.",
            tags: ["Flutter", "Dart", "SQLite", "Jurnal"],
          },
          {
            title: "Mimo: Virtual Pet Interaktif",
            type: "Web",
            pattern: 2,
            image: "../assets/mimo.png",
            href: "https://github.com/arundaya24/mimo",
            desc: "Website virtual pet untuk merawat kucing digital dengan kepribadian, emosi, kustomisasi, dan perilaku interaktif.",
            tags: ["React", "TypeScript", "Laravel", "Virtual Pet"],
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
        contact: {
          email: "kalinggaarundayapriatna1@gmail.com",
          links: [
            {
              label: "WhatsApp",
              value: "081218307660",
              href: "https://wa.me/6281218307660",
            },
            {
              label: "GitHub",
              value: "github.com/arundaya24",
              href: "https://github.com/arundaya24",
            },
          ],
        },
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
            (project, index) => {
              const githubLink = project.href
                ? `<a class="project-github mono" href="${escapeHtml(project.href)}" target="_blank" rel="noopener">Lihat repositori di GitHub</a>`
                : "";
              return `
    <article class="project${index === 0 ? " on" : ""}" tabindex="0" data-index="${index}" data-reveal>
      <span class="type mono">${escapeHtml(project.type || "proyek")}</span>
      <h3>${project.href ? `<a href="${escapeHtml(project.href)}" target="_blank" rel="noopener">${escapeHtml(project.title)}</a>` : escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.desc || "")}</p>
      <div class="tags">${(project.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="m-cover">${coverMarkup(project, index)}</div>
      ${githubLink}
    </article>`;
            },
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
                cover.setAttribute("role", "button");
                cover.setAttribute(
                  "tabindex",
                  cover.parentElement.id === "preview" &&
                    !cover.classList.contains("on")
                    ? "-1"
                    : "0",
                );
                if (cover.parentElement.id === "preview")
                  cover.setAttribute(
                    "aria-hidden",
                    String(!cover.classList.contains("on")),
                  );
                cover.setAttribute(
                  "aria-label",
                  `Perbesar gambar proyek ${project.title}`,
                );
                const ratio = `${image.naturalWidth} / ${image.naturalHeight}`;
                cover.style.setProperty("--cover-ratio", ratio);
                const mobileFrame = cover.closest(".m-cover");
                if (mobileFrame) mobileFrame.style.aspectRatio = ratio;
                if (
                  cover.classList.contains("on") &&
                  cover.parentElement.id === "preview"
                )
                  cover.parentElement.style.aspectRatio = ratio;
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
          covers.forEach((cover, i) => {
            const active = i === index;
            cover.classList.toggle("on", active);
            cover.tabIndex =
              active && cover.classList.contains("has-img") ? 0 : -1;
            cover.setAttribute("aria-hidden", String(!active));
          });
          byId("preview").style.aspectRatio =
            covers[index].style.getPropertyValue("--cover-ratio") || "4 / 5";
        };
        rows.forEach((row, index) => {
          row.addEventListener("pointerenter", () => activate(index));
          row.addEventListener("focus", () => activate(index));
        });
      };

      const bindImageZoom = () => {
        const dialog = byId("image-dialog");
        const dialogImage = byId("image-dialog-image");
        const zoomLevel = byId("image-zoom-level");
        const zoomOut = byId("image-zoom-out");
        const zoomIn = byId("image-zoom-in");
        let zoom = 1;

        const setZoom = (value) => {
          zoom = Math.min(Math.max(value, 1), 4);
          dialogImage.style.transform = `scale(${zoom})`;
          dialogImage.classList.toggle("zoomed", zoom > 1);
          zoomLevel.value = `${Math.round(zoom * 100)}%`;
          zoomOut.disabled = zoom === 1;
          zoomIn.disabled = zoom === 4;
        };

        const activateCover = (event) => {
          if (
            event.type === "keydown" &&
            event.key !== "Enter" &&
            event.key !== " "
          )
            return;
          const cover = event.target.closest(".cover");
          if (
            !cover ||
            !event.currentTarget.contains(cover) ||
            !cover.classList.contains("has-img")
          )
            return;
          if (event.type === "keydown") event.preventDefault();
          const image = cover.querySelector("img");
          if (!image) return;
          byId("image-dialog-title").textContent = image.alt;
          dialogImage.src = image.src;
          dialogImage.alt = image.alt;
          setZoom(1);
          dialog.showModal();
        };

        [byId("preview"), byId("projects")].forEach((container) => {
          container.addEventListener("click", activateCover);
          container.addEventListener("keydown", activateCover);
        });
        byId("image-dialog-close").addEventListener("click", () =>
          dialog.close(),
        );
        zoomOut.addEventListener("click", () => setZoom(zoom - 0.5));
        zoomIn.addEventListener("click", () => setZoom(zoom + 0.5));
        byId("image-zoom-reset").addEventListener("click", () => setZoom(1));
        dialogImage.addEventListener("click", () =>
          setZoom(zoom === 1 ? 2 : 1),
        );
        dialog.addEventListener("keydown", (event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          dialog.close();
        });
        dialog.addEventListener("click", (event) => {
          if (event.target === dialog) dialog.close();
        });
        dialog.addEventListener("close", () => setZoom(1));
        setZoom(1);
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
            `<a class="contact-link" href="mailto:${escapeHtml(email)}"><span class="contact-name mono">Email</span><span class="contact-value">${escapeHtml(email)}</span></a>`,
          );
        links
          .filter((link) => link.href)
          .forEach((link) =>
            items.push(
              `<a class="contact-link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener"><span class="contact-name mono">${escapeHtml(link.label)}</span><span class="contact-value">${escapeHtml(link.value || link.href)}</span></a>`,
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

      const bindTheme = () => {
        const toggle = byId("theme-toggle");
        if (!toggle) return;

        const applyTheme = (theme) => {
          document.documentElement.dataset.theme = theme;
          toggle.setAttribute(
            "aria-label",
            theme === "dark"
              ? "Aktifkan mode terang"
              : "Aktifkan mode gelap",
          );
          toggle.setAttribute(
            "title",
            theme === "dark" ? "Gunakan mode terang" : "Gunakan mode gelap",
          );
        };

        applyTheme(document.documentElement.dataset.theme || "light");
        toggle.addEventListener("click", () => {
          const next =
            document.documentElement.dataset.theme === "dark"
              ? "light"
              : "dark";
          applyTheme(next);
          try {
            localStorage.setItem("portfolio-theme", next);
          } catch {}
        });
      };

      const init = () => {
        renderProjects();
        renderPrinciples();
        renderFocus();
        renderContact();
        bindTheme();
        loadCoverImages();
        bindPreview();
        bindImageZoom();
        bindReveal();
        bindMagnetic();
        bindProgress();
      };

      init();