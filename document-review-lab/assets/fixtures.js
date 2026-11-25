function field(id, label, value, source, extracted = { value, source }) {
  return { id, label, expected: { value, source }, extracted };
}

export const documents = [
  {
    id: "invoice",
    title: "Invoice",
    issuer: "Fable Ridge Office Supply",
    lines: [
      { label: "Invoice number", value: "INV-2048" },
      { label: "Issued", value: "03 Nov 2026" },
      { label: "Bill to", value: "Tallow Creek Studio" },
      { label: "Items", value: "8 desk lamps and 4 monitor stands" },
      { label: "Subtotal", value: "$480.00" },
      { label: "Sales tax", value: "$38.40" },
      { label: "Total due", value: "$518.40", total: true },
      { label: "Payment reference", value: "INV-2048" },
    ],
    fields: [
      field("invoice-number", "Invoice number", "INV-2048", 1, { value: "INV-2048", source: 8 }),
      field("invoice-date", "Issue date", "03 Nov 2026", 2),
      field("invoice-subtotal", "Subtotal", "$480.00", 5, { value: "$518.40", source: 7 }),
      field("invoice-total", "Total due", "$518.40", 7),
    ],
  },
  {
    id: "purchase-order",
    title: "Purchase order",
    issuer: "Tallow Creek Studio",
    lines: [
      { label: "Purchase order", value: "PO-7319" },
      { label: "Order date", value: "05 Nov 2026" },
      { label: "Supplier", value: "Morrow Field Equipment" },
      { label: "Requested delivery", value: "19 Nov 2026" },
      { label: "Ship to", value: "Tallow Creek Studio, Receiving" },
      { label: "Items", value: "6 storage racks" },
      { label: "Order total", value: "$1,260.00", total: true },
    ],
    fields: [
      field("order-number", "Purchase order number", "PO-7319", 1),
      field("order-supplier", "Supplier", "Morrow Field Equipment", 3),
      field("order-delivery", "Requested delivery date", "19 Nov 2026", 4, { value: "05 Nov 2026", source: 2 }),
      field("order-total", "Order total", "$1,260.00", 7),
    ],
  },
  {
    id: "receipt",
    title: "Receipt",
    issuer: "Copper Finch Stationery",
    lines: [
      { label: "Receipt number", value: "RC-5831" },
      { label: "Purchase date", value: "08 Nov 2026" },
      { label: "Items", value: "3 notebooks and 1 pen set" },
      { label: "Subtotal", value: "$46.00" },
      { label: "Sales tax", value: "$3.68" },
      { label: "Total paid", value: "$49.68", total: true },
      { label: "Tender", value: "Card" },
    ],
    fields: [
      field("receipt-number", "Receipt number", "RC-5831", 1),
      field("receipt-date", "Purchase date", "08 Nov 2026", 2),
      field("receipt-tax", "Sales tax", "$3.68", 5, { value: "", source: null }),
      field("receipt-total", "Total paid", "$49.68", 6),
    ],
  },
];
