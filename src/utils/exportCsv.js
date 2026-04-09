/**
 * Generic CSV export utility
 * @param {Array<Object>} rows - data rows
 * @param {Array<{key: string, label: string}>} columns - column definitions
 * @param {string} filename - output filename (without .csv)
 */
export function exportToCsv(rows, columns, filename = "export") {
  const header = columns.map(c => `"${c.label}"`).join(",");
  const body = rows.map(row =>
    columns.map(c => {
      const val = row[c.key] ?? "";
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  ).join("\n");

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}