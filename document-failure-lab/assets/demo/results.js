export const variantIds = ["clean", "stamp", "tilt", "blur"];

const fieldLabels = new Map([
  ["invoice_number", "Invoice no."],
  ["invoice_date", "Invoice date"],
  ["supplier", "Supplier"],
  ["subtotal", "Subtotal"],
  ["total_amount", "Total due"],
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isMissing(value) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

function decimalKey(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parts = String(value).trim().match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!parts || !(parts[2] || parts[3])) return null;
  const [, sign, whole, fraction = "", exponent = "0"] = parts;
  const digits = (whole + fraction).replace(/^0+/, "");
  if (!digits) return "0";
  const significant = digits.replace(/0+$/, "");
  const scale = BigInt(exponent) - BigInt(fraction.length) + BigInt(digits.length - significant.length);
  return [sign === "-" ? "-" : "+", significant, scale].join(":");
}

function expectedFields(input) {
  if (!isObject(input) || Object.keys(input).length === 0) {
    throw new Error("Use a non-empty fields object for expected values.");
  }
  return new Map(Object.entries(input).map(([id, field]) => {
    if (!isObject(field) || !["text", "amount"].includes(field.type)) {
      throw new Error('Use type "text" or "amount" for field "' + id + '".');
    }
    const valid = field.type === "amount"
      ? decimalKey(field.expected) !== null
      : typeof field.expected === "string" && !isMissing(field.expected);
    if (!valid) throw new Error('Add a valid expected value for field "' + id + '".');
    return [id, field];
  }));
}

function readVariants(input) {
  if (!isObject(input)) throw new Error('Add a "variants" object to the JSON.');
  const variants = new Map();
  for (const [id, values] of Object.entries(input)) {
    if (!variantIds.includes(id)) throw new Error('Unknown variant "' + id + '". Use clean, stamp, tilt or blur.');
    if (values === null) continue;
    if (!isObject(values)) throw new Error('Use a field object or null for "' + id + '".');
    for (const [field, value] of Object.entries(values)) {
      if (value !== null && typeof value !== "string" && typeof value !== "boolean" && !Number.isFinite(value)) {
        throw new Error('Use text, a number, true, false or null for "' + id + "." + field + '".');
      }
    }
    variants.set(id, new Map(Object.entries(values)));
  }
  if (!variants.size) throw new Error("Add results for at least one variant.");
  return variants;
}

function statusFor(id, values, extracted, reference, kind, type) {
  if (!values) return "Not run";
  if (kind === "clean" && isMissing(reference)) return "No baseline";
  if (kind === "clean" && id === "clean") return "Baseline";
  if (isMissing(extracted)) return "Missing";

  if (type === "amount") {
    return decimalKey(extracted) === decimalKey(reference) ? "Match" : "Wrong";
  }
  const normalize = (value) => typeof value === "string" ? value.trim() : value;
  if (normalize(extracted) === normalize(reference)) return "Match";
  return kind === "clean" ? "Changed" : "Wrong";
}

export function compareResults(data, expected) {
  if (!isObject(data)) throw new Error("Use a JSON object for the results.");
  const source = data.source ?? "measured";
  if (!["measured", "simulated"].includes(source)) {
    throw new Error('Use "measured" or "simulated" for the results source.');
  }
  const variants = readVariants(data.variants);
  const fields = expected !== undefined ? expectedFields(expected) : null;
  const keys = fields ? [...fields.keys()] : [...new Set([...variants.values()].flatMap((values) => [...values.keys()]))];
  if (!keys.length) throw new Error("Add at least one extracted field.");
  if (keys.length > 200) throw new Error("Use at most 200 fields in a comparison.");
  const kind = fields ? "expected" : "clean";
  const clean = variants.get("clean");
  const outcomes = Object.fromEntries(variantIds.map((id) => {
    const values = variants.get(id);
    const rows = keys.map((key) => {
      const field = fields?.get(key);
      const reference = kind === "expected" ? field.expected : clean?.get(key);
      const extracted = values?.get(key);
      const status = statusFor(id, values, extracted, reference, kind, field?.type);
      return {
        label: fieldLabels.get(key) ?? key.replaceAll("_", " "),
        reference: isMissing(reference) ? "—" : String(reference),
        extracted: isMissing(extracted) ? "—" : String(extracted),
        status,
      };
    });
    return [id, { rows, ran: Boolean(values) }];
  }));
  return { source, kind, hasClean: Boolean(clean), outcomes };
}
