import { compareResults } from "./results.js";
import { activateTabs, renderViewer } from "./viewer.js";

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

async function loadJson(path) {
  const result = await fetch(path);
  if (!result.ok) throw new Error(`Could not load ${path}: HTTP ${result.status}`);
  return result.json();
}

async function start() {
  const [invoice, results] = await Promise.all([
    loadJson("./assets/invoice-case.json"),
    loadJson("./assets/simulated-results.json"),
  ]);
  if (results.source !== "simulated") throw new Error("This demo expects simulated results");

  renderViewer(variants, compareResults(results, invoice.fields));
  activateTabs(document.getElementById("variant-tabs"));
}

start().catch((error) => {
  console.error(error);
  document.getElementById("load-error").hidden = false;
});
