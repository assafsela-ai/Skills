const panelTemplate = document.createElement("template");
panelTemplate.innerHTML = `
  <div class="variant-summary">
    <div>
      <h2></h2>
      <p class="finding"></p>
    </div>
    <p class="result-count"></p>
  </div>
  <div class="workspace">
    <figure class="invoice">
      <figcaption>
        <span>Invoice preview</span>
        <a class="text-link"></a>
      </figcaption>
      <div class="image-stage"><img alt="" decoding="async"></div>
    </figure>
    <div class="results">
      <p class="awaiting-results">Import a results JSON to compare fields for this image.</p>
      <table hidden>
        <caption>Field comparison</caption>
        <thead><tr>
          <th scope="col">Field</th>
          <th scope="col" class="reference-heading">Expected</th>
          <th scope="col">Extracted</th>
          <th scope="col">Status</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
`;

function makeRow({ label, reference, extracted, status }) {
  const row = document.createElement("tr");
  row.dataset.status = status.toLowerCase();
  const heading = document.createElement("th");
  heading.scope = "row";
  heading.textContent = label;
  row.append(heading);
  for (const text of [reference, extracted, status]) row.insertCell().textContent = text;
  row.lastElementChild.className = "field-status";
  return row;
}

function renderPanel(panel, variant, outcome, kind) {
  const contents = panelTemplate.content.cloneNode(true);
  const summary = contents.querySelector(".variant-summary");
  summary.querySelector("h2").textContent = variant.title;
  summary.querySelector(".finding").textContent = variant.note;

  const image = contents.querySelector("img");
  [image.width, image.height] = variant.size;
  image.alt = variant.alt;
  image.src = variant.image;
  const link = contents.querySelector("figure a");
  link.href = variant.image;
  if (variant.download) {
    link.download = variant.download;
    link.textContent = "Download PNG";
    link.setAttribute("aria-label", "Download PNG for " + variant.title);
  } else {
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Open full image";
    link.setAttribute("aria-label", "Open full image in a new tab");
  }

  const count = summary.querySelector(".result-count");
  count.hidden = !outcome;
  if (outcome) {
    const { rows, ran } = outcome;
    const matches = rows.filter((row) => row.status === "Match").length;
    const failures = rows.filter((row) => ["Wrong", "Missing", "Changed"].includes(row.status)).length;
    summary.classList.toggle("has-failure", failures > 0);

    if (!ran) count.textContent = "Not run";
    else if (kind === "clean" && panel.id === "panel-clean") count.textContent = "Baseline";
    else {
      // The denominator covers only fields with a reference value.
      const compared = matches + failures;
      if (compared === 1) count.textContent = matches ? "1 field matches" : "1 field differs";
      else count.textContent = compared ? matches + " of " + compared + " fields match" : "No comparable fields";
    }

    contents.querySelector(".reference-heading").textContent = kind === "clean" ? "Clean" : "Expected";
    contents.querySelector("tbody").append(...rows.map(makeRow));
    contents.querySelector(".awaiting-results").hidden = true;
    contents.querySelector("table").hidden = false;
  }
  panel.replaceChildren(contents);
}

export function renderViewer(variants, comparison = null) {
  for (const [id, variant] of Object.entries(variants)) {
    renderPanel(
      document.getElementById("panel-" + id), variant, comparison?.outcomes[id], comparison?.kind,
    );
  }
  document.getElementById("lab").hidden = false;
}

export function activateTabs(tabList) {
  const tabs = [...tabList.querySelectorAll("button")];
  const nativeFocusGroup = Object.hasOwn(HTMLElement.prototype, "focusGroup");

  function select(selected) {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.toggleAttribute("focusgroupstart", active);
      if (nativeFocusGroup) tab.removeAttribute("tabindex");
      else tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.id.replace("tab-", "panel-")).hidden = !active;
    }

    const bounds = tabList.getBoundingClientRect();
    const button = selected.getBoundingClientRect();
    if (button.left < bounds.left || button.right > bounds.right) {
      selected.scrollIntoView({ block: "nearest", inline: "nearest", container: "nearest" });
    }
  }

  for (const tab of tabs) {
    tab.addEventListener("focus", () => select(tab));
    tab.addEventListener("click", () => select(tab));
  }
  tabList.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const index = tabs.indexOf(event.target);
    if (index < 0) return;
    const nextByKey = {
      Home: 0,
      End: tabs.length - 1,
      ...(!nativeFocusGroup && {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
      }),
    };
    if (!Object.hasOwn(nextByKey, event.key)) return;
    event.preventDefault();
    tabs[nextByKey[event.key]].focus();
  });

  select(tabs[0]);
  return () => select(tabs[0]);
}
