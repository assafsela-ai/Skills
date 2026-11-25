import assert from "node:assert/strict";
import test from "node:test";
import { extractInvoiceFields } from "../assets/demo/invoice-fields.js";

test("extracts all five fields from a labeled English invoice", () => {
  assert.deepEqual(extractInvoiceFields([
    "N Northline Office Supply INVOICE",
    "INVOICE NO. INV-1042   ISSUE DATE 2026-11-25",
    "Subtotal 120.00    Total due (USD) 125.40",
  ].join("\n")), {
    invoice_number: "INV-1042",
    invoice_date: "2026-11-25",
    supplier: "Northline Office Supply",
    subtotal: "120.00",
    total_amount: "125.40",
  });
});

test("extracts common Hebrew labels and amounts that precede labels", () => {
  assert.deepEqual(extractInvoiceFields([
    "חשבונית מס",
    "שם הספק: נורתליין ישראל",
    "מספר חשבונית: 5421",
    "תאריך החשבונית: 25/11/2026",
    '₪1,000.00   סכום לפני מע"מ',
    'סה"כ לתשלום ₪1,180.00',
  ].join("\n")), {
    invoice_number: "5421",
    invoice_date: "25/11/2026",
    supplier: "נורתליין ישראל",
    subtotal: "1000.00",
    total_amount: "1180.00",
  });
});

test("does not use the subtotal as the total or the due date as the invoice date", () => {
  const fields = extractInvoiceFields(
    "Seller: Example Co\nDue date: 10/12/2026\nSubtotal: 120.00\nSales tax: 5.40\nTotal due:",
  );
  assert.equal(fields.subtotal, "120.00");
  assert.equal(fields.total_amount, null);
  assert.equal(fields.invoice_date, null);
});

test("normalizes decimal comma, grouping, and a negative amount", () => {
  const fields = extractInvoiceFields("Vendor: Example Co\nSubtotal: EUR 1.234,50\nGrand total: (EUR 1.250,50)");
  assert.equal(fields.subtotal, "1234.50");
  assert.equal(fields.total_amount, "-1250.50");
});

test("keeps blank OCR fields unread", () => {
  assert.deepEqual(extractInvoiceFields(""), {
    invoice_number: null, invoice_date: null, supplier: null, subtotal: null, total_amount: null,
  });
});
