import { createVariants, openInvoice, pngBlob } from "./images.js";
import { recognizeVariants } from "./ocr.js";
import { compareResults } from "./results.js";
import { activateTabs, renderViewer } from "./viewer.js";

const labels = {
  clean: ["Clean baseline", "Use this image as the reference.", "Your clean invoice."],
  stamp: ["Stamped invoice", "A translucent stamp covers the selected area.", "Your invoice with a translucent red stamp."],
  tilt: ["Tilted invoice", "The image is rotated six degrees with the full page in view.", "Your invoice rotated six degrees counterclockwise."],
  blur: ["Blurred invoice", "The selected area is blurred.", "Your invoice with a blurred area."],
};
const defaultRegions = { stamp: [65, 76, 92, 84], blur: [52, 21, 91, 27] };
const element = (id) => document.getElementById(id);

const invoiceFile = element("invoice-file");
const invoiceStatus = element("invoice-status");
const form = element("variant-form");
const radios = element("area-options");
const coordinateFieldset = form.querySelector(".coordinate-fieldset");
const coordinateOptions = form.querySelector(".coordinate-options");
const preview = element("region-preview");
const sourceImage = element("source-preview");
const outline = element("region-outline");
const edges = ["left", "top", "right", "bottom"].map((name) => form.elements.namedItem(name));
const generate = element("generate");
const generationError = element("generation-error");
const generationStatus = element("generation-status");
const extract = element("extract");
const ocrProgress = element("ocr-progress");
const ocrStatus = element("ocr-status");
const ocrError = element("ocr-error");
const resultsFile = element("results-file");
const resultsStatus = element("results-status");
const comparisonNote = element("comparison-note");
const resetTabs = activateTabs(element("variant-tabs"));

let source = null;
let cleanBlob = null;
let previewUrl = null;
let regions = { ...defaultRegions };
let area = "stamp";
let run = null;
let edited = false;
let drag = null;

function showError(input, message) {
  const hintId = input.id === "invoice-file" ? "invoice-hint" : "results-hint";
  const errorId = input.id === "invoice-file" ? "invoice-error" : "results-error";
  const output = element(errorId);
  input.setAttribute("aria-invalid", String(Boolean(message)));
  input.setAttribute("aria-describedby", message ? hintId + " " + errorId : hintId);
  output.hidden = !message;
  output.textContent = message;
}

function regionError(message, invalidEdges = []) {
  for (const input of edges) {
    const invalid = invalidEdges.includes(input);
    input.setAttribute("aria-invalid", String(invalid));
    input.setAttribute("aria-describedby", invalid ? "coordinate-hint generation-error" : "coordinate-hint");
  }
  generationError.hidden = !message;
  generationError.textContent = message;
}

function showBox([left, top, right, bottom]) {
  outline.style.inset = [top, 100 - right, 100 - bottom, left].map((value) => value + "%").join(" ");
  outline.dataset.area = area;
}

function fillEdges() {
  const box = regions[area];
  edges.forEach((input, index) => { input.value = box[index]; });
  showBox(box);
  regionError("");
}

function setRegion(box) {
  if (box.some((value, index) => value !== regions[area][index])) {
    regions[area] = box;
    if (run) {
      edited = true;
      generationStatus.textContent = "Generate again to apply the new areas and clear results from the previous images.";
    }
  }
  showBox(box);
  regionError("");
}

function saveEdges() {
  const box = edges.map((input) => input.valueAsNumber);
  const invalid = edges.filter((input) => !input.validity.valid);
  if (invalid.length) {
    regionError("Enter whole-number percentages from 0 to 100 for the area edges.", invalid);
    return false;
  }
  if (box[0] >= box[2] || box[1] >= box[3]) {
    const invalidEnds = [
      ...(box[0] >= box[2] ? [edges[2]] : []),
      ...(box[1] >= box[3] ? [edges[3]] : []),
    ];
    regionError("Place the right edge after the left edge and the bottom edge below the top edge.", invalidEnds);
    return false;
  }
  setRegion(box);
  return true;
}

function clearOcrFeedback() {
  ocrError.hidden = true;
  ocrError.textContent = "";
  ocrStatus.textContent = "";
}

function clearRun() {
  if (!run) return;
  for (const variant of Object.values(run)) URL.revokeObjectURL(variant.image);
  for (const panel of document.querySelectorAll('[role="tabpanel"]')) panel.replaceChildren();
  run = null;
  edited = false;
  element("lab").hidden = true;
  element("import-section").hidden = true;
  resultsFile.value = "";
  resultsStatus.textContent = "";
  clearOcrFeedback();
  showError(resultsFile, "");
}

for (const input of [invoiceFile, resultsFile]) {
  input.addEventListener("click", () => { input.value = ""; });
}

invoiceFile.addEventListener("change", async () => {
  const file = invoiceFile.files[0];
  if (!file) return;
  const restoreFocus = document.activeElement === invoiceFile;
  showError(invoiceFile, "");
  invoiceFile.disabled = true;
  generate.disabled = true;
  try {
    const opened = await openInvoice(file);
    const image = await pngBlob(opened.canvas);
    clearRun();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (source) source.width = 0;
    source = opened.canvas;
    cleanBlob = image;
    previewUrl = URL.createObjectURL(image);
    sourceImage.width = source.width;
    sourceImage.height = source.height;
    sourceImage.src = previewUrl;
    regions = { ...defaultRegions };
    area = "stamp";
    form.elements.namedItem("area").value = area;
    fillEdges();
    regionError("");
    generationStatus.textContent = "";
    form.hidden = false;
    invoiceStatus.textContent = file.name + " · " + source.width + " × " + source.height +
      (opened.resized ? " pixels after resizing." : " pixels.");
  } catch (error) {
    showError(invoiceFile, error.message);
  } finally {
    invoiceFile.disabled = false;
    generate.disabled = false;
    if (restoreFocus && document.activeElement === document.body) invoiceFile.focus();
  }
});

radios.addEventListener("change", (event) => {
  if (!saveEdges()) {
    form.elements.namedItem("area").value = area;
    return;
  }
  area = event.target.value;
  fillEdges();
});

for (const input of edges) {
  input.addEventListener("change", saveEdges);
}
form.addEventListener("invalid", () => {
  coordinateOptions.open = true;
  saveEdges();
}, true);

function point(event) {
  const rect = preview.getBoundingClientRect();
  const percent = (offset, size) => Math.max(0, Math.min(100, Math.round(100 * offset / size)));
  return [percent(event.clientX - rect.left, rect.width), percent(event.clientY - rect.top, rect.height)];
}

function draggedBox(first, second) {
  return [Math.min(first[0], second[0]), Math.min(first[1], second[1]),
    Math.max(first[0], second[0]), Math.max(first[1], second[1])];
}

preview.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.button !== 0 || generate.disabled) return;
  drag = { id: event.pointerId, start: point(event) };
  preview.setPointerCapture(event.pointerId);
});

preview.addEventListener("pointermove", (event) => {
  if (drag?.id === event.pointerId) showBox(draggedBox(drag.start, point(event)));
});

preview.addEventListener("pointerup", (event) => {
  if (drag?.id !== event.pointerId) return;
  const box = draggedBox(drag.start, point(event));
  drag = null;
  if (box[2] > box[0] && box[3] > box[1]) setRegion(box);
  fillEdges();
});

preview.addEventListener("lostpointercapture", () => {
  if (!drag) return;
  drag = null;
  fillEdges();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!source) return;
  if (!saveEdges()) {
    coordinateOptions.open = true;
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  radios.disabled = true;
  coordinateFieldset.disabled = true;
  generate.disabled = true;
  invoiceFile.disabled = true;
  generationStatus.textContent = "Generating images…";
  try {
    const images = await createVariants(source, regions, cleanBlob);
    clearRun();
    run = Object.fromEntries(Object.entries(images).map(([id, { blob, size }]) => {
      const [title, note, alt] = labels[id];
      return [id, { title, note, alt, size, blob, image: URL.createObjectURL(blob), download: id + ".png" }];
    }));
    renderViewer(run);
    resetTabs();
    comparisonNote.textContent = "Waiting for extraction results";
    element("import-section").hidden = false;
    generationStatus.textContent = "Four PNG images are ready.";
    element("import-title").focus();
  } catch (error) {
    generationStatus.textContent = "";
    regionError(error.message);
  } finally {
    radios.disabled = false;
    coordinateFieldset.disabled = false;
    generate.disabled = false;
    invoiceFile.disabled = false;
  }
});

resultsFile.addEventListener("change", async () => {
  const file = resultsFile.files[0];
  if (!file || !run) return;
  const activeRun = run;
  const restoreFocus = document.activeElement === resultsFile;
  showError(resultsFile, "");
  resultsFile.disabled = true;
  try {
    if (edited) throw new Error("Generate the new images before importing results.");
    if (file.size > 1024 * 1024) throw new Error("Choose a results JSON under 1 MB.");
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      throw new Error("This file is not valid JSON. Start with the results template.");
    }
    if (run !== activeRun) return;
    if (edited) throw new Error("Generate the new images before importing results.");

    const comparison = compareResults(data, data?.fields);
    renderViewer(run, comparison);
    clearOcrFeedback();
    const sourceLabel = comparison.source === "simulated" ? "Simulated results" : "Imported results";
    const reference = comparison.kind === "expected" ? "compared with expected values"
      : comparison.hasClean ? "compared with clean results" : "clean results unavailable";
    comparisonNote.textContent = sourceLabel + " · " + reference;
    resultsStatus.textContent = "Loaded " + file.name + ". Select an image to review its fields.";
  } catch (error) {
    if (run === activeRun) showError(resultsFile, error.message);
  } finally {
    resultsFile.disabled = false;
    if (restoreFocus && document.activeElement === document.body) resultsFile.focus();
  }
});

extract.addEventListener("click", async () => {
  if (!run || generate.disabled || resultsFile.disabled) return;
  clearOcrFeedback();
  if (edited) {
    ocrError.hidden = false;
    ocrError.textContent = "Generate the new images before extracting fields.";
    return;
  }

  const restoreFocus = document.activeElement === extract;
  const controls = [invoiceFile, generate, radios, coordinateFieldset, resultsFile, extract];
  for (const control of controls) control.disabled = true;
  ocrProgress.removeAttribute("value");
  ocrProgress.hidden = false;
  ocrStatus.textContent = "Loading the local OCR engine…";

  try {
    let completed = 0;
    const data = await recognizeVariants(run, {
      onStep: (id) => {
        ocrProgress.value = completed;
        ocrStatus.textContent = "Reading image " + (completed + 1) + " of 4 · " + labels[id][0];
      },
      onComplete: () => { ocrProgress.value = ++completed; },
    });
    const comparison = compareResults(data);
    renderViewer(run, comparison);
    resultsStatus.textContent = "";
    resultsFile.value = "";
    showError(resultsFile, "");
    const hasValues = (fields) => Object.values(fields).some((value) => value !== null);
    const hasBaseline = hasValues(data.variants.clean);
    comparisonNote.textContent = hasBaseline
      ? "Local OCR · compared with clean results" : "Local OCR · no readable fields on Clean";
    if (hasBaseline) ocrStatus.textContent = "Extraction complete. Select a version to review the comparison.";
    else if (Object.values(data.variants).some(hasValues)) {
      ocrStatus.textContent = "Extraction complete. Clean returned no fields to compare against.";
    } else {
      ocrStatus.textContent = "OCR could not read the fields in these images. Try a clearer invoice.";
    }
  } catch (error) {
    console.error(error);
    ocrStatus.textContent = "";
    ocrError.hidden = false;
    ocrError.textContent = "OCR could not finish. Try again or import results from another extractor.";
  } finally {
    ocrProgress.hidden = true;
    for (const control of controls) control.disabled = false;
    if (restoreFocus && document.activeElement === document.body) extract.focus();
  }
});
