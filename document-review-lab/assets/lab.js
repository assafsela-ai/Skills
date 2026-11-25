import { documents } from "./fixtures.js";
import { failureType, summarize } from "./review.js";

const byId = (id) => document.getElementById(id);
const allFields = documents.flatMap((sample) => sample.fields);
const savedReviews = new Map();
const drafts = new Map();
const documentButtons = new Map();
const fieldButtons = new Map();

const valueInput = byId("review-value");
const sourceSelect = byId("review-source");
const feedback = byId("review-feedback");
const findSource = byId("find-source");
const saveButton = byId("save-review");

let activeDocument = documents[0];
let activeField = activeDocument.fields[0];
let sourceLines = [];

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) {
    node.className = className;
  }
  return node;
}

function readDraft() {
  return {
    value: valueInput.value,
    source: sourceSelect.value ? Number(sourceSelect.value) : null,
  };
}

function currentResult() {
  return savedReviews.get(activeField.id) ?? activeField.extracted;
}

function updateEditorState() {
  const draft = readDraft();
  const saved = currentResult();
  const changed = draft.value.trim() !== saved.value || draft.source !== saved.source;
  saveButton.textContent = changed ? "Save correction" : "Confirm field";
  findSource.hidden = draft.source === null;

  for (const [index, line] of sourceLines.entries()) {
    if (index + 1 === draft.source) {
      line.setAttribute("aria-current", "true");
    } else {
      line.removeAttribute("aria-current");
    }
  }
}

function fieldStatus(field) {
  const saved = savedReviews.get(field.id);
  if (!saved) {
    return "To review";
  }
  return failureType(field.expected, saved) ? "Needs attention" : "Reviewed";
}

function updateFieldList() {
  for (const field of activeDocument.fields) {
    const { button, status } = fieldButtons.get(field.id);
    button.setAttribute("aria-pressed", String(field === activeField));
    status.textContent = fieldStatus(field);
  }
  const reviewed = activeDocument.fields.filter((field) => savedReviews.has(field.id)).length;
  byId("document-progress").textContent = reviewed + " / " + activeDocument.fields.length + " reviewed";
}

function selectField(field) {
  activeField = field;
  const draft = drafts.get(field.id) ?? currentResult();
  byId("field-heading").textContent = field.label;

  const original = field.extracted.value || "No value";
  const source = field.extracted.source === null ? "no source cited" : "line " + field.extracted.source;
  byId("original-value").textContent = "Original extraction · " + original + " · " + source;
  valueInput.value = draft.value;
  sourceSelect.value = draft.source ?? "";
  feedback.textContent = "";
  updateFieldList();
  updateEditorState();
}

function showDocument(sample) {
  activeDocument = sample;
  for (const [id, button] of documentButtons) {
    button.setAttribute("aria-pressed", String(id === sample.id));
  }
  byId("document-issuer").textContent = sample.issuer;
  byId("document-title").textContent = sample.title;

  sourceLines = sample.lines.map((line, index) => {
    const row = element("li", "", "source-line");
    row.tabIndex = -1;
    if (line.total) {
      row.classList.add("total-line");
    }
    const number = element("span", String(index + 1), "line-number");
    number.setAttribute("aria-label", "Line " + (index + 1));
    row.append(number, element("span", line.label, "line-label"), element("strong", line.value, "line-value"));
    return row;
  });
  byId("source-lines").replaceChildren(...sourceLines);

  sourceSelect.replaceChildren(
    new Option("No source cited", ""),
    ...sample.lines.map((line, index) => new Option(
      "Line " + (index + 1) + " · " + line.label + " · " + line.value,
      String(index + 1),
    )),
  );

  fieldButtons.clear();
  const rows = sample.fields.map((field) => {
    const row = element("li", "");
    const button = element("button", "", "field-choice");
    const status = element("span", "", "field-status");
    button.type = "button";
    button.append(element("span", field.label), status);
    button.addEventListener("click", () => selectField(field));
    fieldButtons.set(field.id, { button, status });
    row.append(button);
    return row;
  });
  byId("field-list").replaceChildren(...rows);
  selectField(sample.fields[0]);
}

function updateSummary() {
  const summary = summarize(allFields, savedReviews);
  byId("reviewed-count").textContent = summary.reviewed + " / " + allFields.length;
  byId("original-count").textContent = summary.original;
  byId("remaining-count").textContent = summary.remaining;
  byId("failure-counts").replaceChildren(...Array.from(summary.breakdown, ([label, count]) => {
    const row = element("tr", "");
    const heading = element("th", label);
    heading.scope = "row";
    row.append(heading, element("td", count.original), element("td", count.remaining));
    return row;
  }));
  return summary;
}

function updateDraft() {
  drafts.set(activeField.id, readDraft());
  feedback.textContent = "";
  updateEditorState();
}

valueInput.addEventListener("input", updateDraft);
sourceSelect.addEventListener("change", updateDraft);
findSource.addEventListener("click", () => {
  const line = sourceLines[Number(sourceSelect.value) - 1];
  line?.focus();
});
byId("back-to-field").addEventListener("click", () => {
  fieldButtons.get(activeField.id).button.focus();
});

byId("field-editor").addEventListener("submit", (event) => {
  event.preventDefault();
  const draft = readDraft();
  const result = { ...draft, value: draft.value.trim() };
  savedReviews.set(activeField.id, result);
  drafts.delete(activeField.id);
  valueInput.value = result.value;
  updateFieldList();
  updateEditorState();
  const summary = updateSummary();
  const failure = failureType(activeField.expected, result);
  const outcome = failure ? "Check again. " + failure + "." : "Field reviewed.";
  const remaining = summary.remaining === 1 ? "1 error remains." : summary.remaining + " errors remain.";
  feedback.textContent = outcome + " " + remaining;
});

byId("reset").addEventListener("click", () => {
  savedReviews.clear();
  drafts.clear();
  showDocument(documents[0]);
  const summary = updateSummary();
  feedback.textContent = "Lab reset. " + summary.original + " original errors restored.";
});

for (const sample of documents) {
  const button = element("button", sample.title, "document-choice");
  button.type = "button";
  button.addEventListener("click", () => showDocument(sample));
  documentButtons.set(sample.id, button);
  byId("document-choices").append(button);
}
showDocument(documents[0]);
updateSummary();
byId("lab").hidden = false;
