const labels = {
  number: [
    /\b(?:invoice|inv\.?)[\s-]*(?:number|no\.?|#)(?![a-z])/iu,
    /(?:חשבונית(?:\s+מס| מס(?:פר)?\s+חשבונית)|מס(?:פר|[׳'״.]?)\s+חשבונית)/u,
  ],
  date: [
    /\b(?:invoice\s+date|issue[d]?\s+date|date\s+issued)\b/iu,
    /תאריך\s+(?:ה?חשבונית|הנפקה)/u,
    /^(?:date\b|תאריך(?!\s+(?:תשלום|פירעון)))/iu,
  ],
  supplier: [
    /^(?:supplier|vendor|seller|issued\s+by)(?:\s+name)?(?=\s*[:=]|$)/iu,
    /^(?:שם\s+(?:ה?ספק|ה?עסק)|ה?ספק|מוכר)(?=\s*[:=]|$)/u,
  ],
  subtotal: [
    /\bsub[\s-]*total\b/iu,
    /\b(?:total|amount)\s+(?:before|excl(?:uding)?\.?)\s+(?:tax|vat)\b/iu,
    /(?:סה[״"׳'”]?\s*כ|סך\s*(?:הכל|הכול)|סכום)\s+(?:לפני|ללא)\s+מע[״"׳'”]?מ/u,
    /^(?:לפני|ללא)\s+מע[״"׳'”]?מ/u,
  ],
  total: [
    /\b(?:grand\s+total|invoice\s+total|total\s+(?:amount|due|payable)|amount\s+due|balance\s+due)\b/iu,
    /(?:(?:סה[״"׳'”]?\s*כ|סך\s*(?:הכל|הכול)|סכום|יתרה)\s+לתשלום|(?:סה[״"׳'”]?\s*כ|סך\s*(?:הכל|הכול)|סכום)\s+כולל\s+מע[״"׳'”]?מ)/u,
    /^total(?=\s*(?:[$₪€£:(]|[0-9]|\b(?:USD|ILS|EUR|GBP)\b|$))/iu,
    /^(?:סה[״"׳'”]?\s*כ|סך\s*(?:הכל|הכול))(?=\s*(?:[:₪(0-9]|$))/u,
  ],
};

const everyLabel = Object.values(labels).flat();
const invoiceHeading = /(?:\btax\s+invoice\b|\binvoice\b|(?:חשבונית\s+מס|חשבונית|קבלה))/giu;

function normalizeText(value) {
  return value.normalize("NFKC").replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "")
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, "-");
}

function trimValue(value) {
  return value.replace(/^[\s:;=#|]+|[\s:;=|]+$/g, "").trim();
}

function findLabeled(lines, rules, parse, reverse = false) {
  const ordered = reverse ? [...lines.keys()].reverse() : [...lines.keys()];
  for (const rule of rules) {
    for (const index of ordered) {
      const line = lines[index];
      const match = line.match(rule);
      if (!match) continue;
      const before = trimValue(line.slice(0, match.index));
      const remainder = trimValue(line.slice(match.index + match[0].length));
      const nextLabel = everyLabel.map((label) => remainder.search(label)).filter((offset) => offset >= 0);
      const after = nextLabel.length ? trimValue(remainder.slice(0, Math.min(...nextLabel))) : remainder;
      const inline = parse(after) || (!everyLabel.some((label) => label.test(before)) && parse(before));
      if (inline) return inline;

      const next = lines[index + 1];
      if (next && !everyLabel.some((label) => label.test(next))) {
        const nearby = parse(next, true);
        if (nearby) return nearby;
      }
    }
  }
  return null;
}

function findNumber(segment, standalone = false) {
  const token = segment.match(/^[\p{L}\p{N}][\p{L}\p{N}/_.-]*/u)?.[0];
  if (!token || !/\d/.test(token) || findDate(token) || (standalone && token !== segment)) return null;
  return token.replace(/[.]+$/, "");
}

function findDate(segment, standalone = false) {
  const match = segment.match(/(?<!\d)(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.](?:\d{4}|\d{2}))(?!\d)/u);
  if (!match || (standalone && match[0] !== segment)) return null;
  const [first, second, last] = match[0].split(/[-/.]/);
  const yearFirst = first.length === 4;
  if (yearFirst) {
    return first + "-" + second.padStart(2, "0") + "-" + last.padStart(2, "0");
  }
  return first.padStart(2, "0") + "/" + second.padStart(2, "0") + "/" + last;
}

function normalizeAmount(token) {
  let value = token.replace(/\s/g, "").replace(/^\((.*)\)$/, "-$1");
  const comma = value.lastIndexOf(",");
  const dot = value.lastIndexOf(".");
  if (comma !== -1 && dot !== -1) {
    value = comma > dot ? value.replaceAll(".", "").replace(",", ".") : value.replaceAll(",", "");
  } else if (comma !== -1) {
    value = value.length - comma === 4 ? value.replaceAll(",", "") : value.replace(",", ".");
  } else if (value.split(".").length > 2) {
    value = value.replaceAll(".", "");
  }
  const parsed = value.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!parsed) return null;
  const [, sign, whole, fraction = ""] = parsed;
  const decimal = fraction.replace(/0+$/, "").padEnd(2, "0");
  const integer = whole.replace(/^0+(?=\d)/, "");
  return (integer === "0" && !/[1-9]/.test(decimal) ? "" : sign) + integer + "." + decimal;
}

function findAmount(segment, standalone = false) {
  const withoutCurrency = segment.replace(/\b(?:USD|ILS|NIS|EUR|GBP|CAD|AUD)\b|[$€₪£]|ש[״"]ח/giu, "").trim();
  const amount = /(?<![\p{L}\p{N}.,])(?:-\s*)?(?:\d{1,3}(?:[ ,.]?\d{3})+|\d+)(?:[,.]\d+)?(?![\p{L}\p{N}])/gu;
  const amounts = [...withoutCurrency.matchAll(amount)];
  if (!amounts.length) return null;
  const token = amounts.at(-1)[0];
  const wrapped = withoutCurrency.match(/^\(\s*(.*?)\s*\)$/u)?.[1] === token;
  if (standalone && !wrapped && token !== withoutCurrency) return null;
  return normalizeAmount(wrapped ? "(" + token + ")" : token);
}

function supplierCandidate(line) {
  const candidate = trimValue(line);
  if (candidate.length > 90 || !/\p{L}{2}/u.test(candidate) || findDate(candidate)) return null;
  if (/^(?:bill\s+to|ship\s+to|customer\b|accounts\s+payable|page\s+\d|issued\b|date\b|לכבוד|לקוח|כתובת|תאריך|עוסק|ח\s*[.״"]?\s*פ)/iu.test(candidate)) return null;
  if (/^(?:invoice|tax\s+invoice|receipt|חשבונית|חשבונית\s+מס|קבלה)$/iu.test(candidate)) return null;
  if (/^(?:fictional\s+vendor|synthetic\s+test\s+document)/iu.test(candidate)) return null;
  return candidate;
}

function findSupplier(lines) {
  const labeled = findLabeled(lines.slice(0, 12), labels.supplier, supplierCandidate);
  if (labeled) return labeled;
  for (const line of lines.slice(0, 6)) {
    if (everyLabel.some((label) => label.test(line))) continue;
    const candidate = line.replace(invoiceHeading, "").replace(/^\p{L}\s+(?=\p{L}{3})/u, "");
    const supplier = supplierCandidate(candidate);
    if (supplier) return supplier;
  }
  return null;
}

export function extractInvoiceFields(text) {
  const lines = normalizeText(text).split(/\r?\n/).map(trimValue).filter(Boolean);
  return {
    invoice_number: findLabeled(lines, labels.number, findNumber),
    invoice_date: findLabeled(lines, labels.date, findDate),
    supplier: findSupplier(lines),
    subtotal: findLabeled(lines, labels.subtotal, findAmount, true),
    total_amount: findLabeled(lines, labels.total, findAmount, true),
  };
}
