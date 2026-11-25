const variants = {
  clean: {
    title: "Clean baseline",
    note: "Use this image as the baseline for the other variants.",
    image: "./assets/invoice.png",
    alt: "Clean synthetic invoice. Subtotal 120.00, total due 125.40.",
    size: [960, 860],
  },
  stamp: {
    title: "Stamp over the total",
    note: "The extracted total matches the subtotal.",
    image: "./assets/demo/stamp.png",
    alt: "The same invoice with a red stamp over the total due. The subtotal above it is clear.",
    size: [960, 860],
  },
  tilt: {
    title: "Tilted invoice",
    note: "The invoice is rotated six degrees with the full page in view.",
    image: "./assets/demo/tilt.png",
    alt: "The same invoice rotated six degrees counterclockwise with all edges still visible.",
    size: [1046, 956],
  },
  blur: {
    title: "Blurred date line",
    note: "The extraction returned no invoice date.",
    image: "./assets/demo/blur.png",
    alt: "The same invoice with the issue date line blurred. The invoice number above it is sharp.",
    size: [960, 860],
  },
};

const fieldLabels = {
  invoice_number: "Invoice no.",
  invoice_date: "Invoice date",
  supplier: "Supplier",
  subtotal: "Subtotal",
  total_amount: "Total due",
};

async function loadJson(path) {
  const result = await fetch(path);
  if (!result.ok) throw new Error(`Could not load ${path}: HTTP ${result.status}`);
  return result.json();
}

function fieldStatus(field, extracted) {
  if (extracted == null || String(extracted).trim() === "") return "Missing";
  if (typeof extracted !== "number" && typeof extracted !== "string") return "Wrong";
  const matches = field.type === "amount"
    ? Number(extracted) === Number(field.expected)
    : typeof extracted === "string" && extracted.trim() === field.expected.trim();
  return matches ? "Match" : "Wrong";
}

function makeRow(fieldId, field, value, status) {
  const row = document.createElement("tr");
  row.dataset.status = status.toLowerCase();
  const heading = document.createElement("th");
  heading.scope = "row";
  heading.textContent = fieldLabels[fieldId];
  row.append(heading);
  for (const text of [field.expected, status === "Missing" ? "—" : value, status]) {
    row.insertCell().textContent = text;
  }
  row.lastElementChild.className = "field-status";
  return row;
}

function renderPanel(panel, variant, fields, values) {
  const contents = document.getElementById("inspection").content.cloneNode(true);
  const rows = Object.entries(fields).map(([id, field]) => ({
    id, field, value: values[id], status: fieldStatus(field, values[id]),
  }));
  const matches = rows.filter((row) => row.status === "Match").length;
  const summary = contents.querySelector(".variant-summary");
  summary.classList.toggle("has-failure", matches !== rows.length);
  summary.querySelector("h2").textContent = variant.title;
  summary.querySelector(".finding").textContent = variant.note;
  summary.querySelector(".result-count").textContent = `${matches} of ${rows.length} fields match`;

  const image = contents.querySelector("img");
  image.width = variant.size[0];
  image.height = variant.size[1];
  image.alt = variant.alt;
  image.src = variant.image;
  contents.querySelector("figure a").href = variant.image;
  contents.querySelector("tbody").append(
    ...rows.map(({ id, field, value, status }) => makeRow(id, field, value, status)),
  );
  panel.append(contents);
}

function activateTabs(tabList) {
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
}

async function start() {
  const [invoice, results] = await Promise.all([
    loadJson("./assets/invoice-case.json"),
    loadJson("./assets/simulated-results.json"),
  ]);
  if (results.source !== "simulated") throw new Error("This demo expects simulated results");

  for (const [id, variant] of Object.entries(variants)) {
    const panel = document.getElementById(`panel-${id}`);
    renderPanel(panel, variant, invoice.fields, results.variants[id]);
  }
  document.getElementById("lab").hidden = false;
  activateTabs(document.getElementById("variant-tabs"));
}

start().catch((error) => {
  console.error(error);
  document.getElementById("load-error").hidden = false;
});
