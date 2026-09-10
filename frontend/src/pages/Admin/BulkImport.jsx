import { useState } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { UploadCloud, Download, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { productService } from "../../services/productService.js";
import { getErrorMessage } from "../../services/api.js";

const TEMPLATE_HEADERS = [
  "name", "sku", "brand", "category", "price", "discountPercent", "stock",
  "description", "shortDescription", "images", "tags",
  "isFeatured", "isBestseller", "isNewArrival", "status",
];

const TEMPLATE_SAMPLE_ROW = [
  "Classic Crew T-Shirt", "NEX-9001", "Nexora Essentials", "Men's Clothing",
  "799", "10", "50",
  "A soft, everyday crew neck t-shirt made from breathable cotton.", "Everyday cotton tee",
  "https://example.com/image1.jpg;https://example.com/image2.jpg", "cotton,casual",
  "false", "false", "true", "active",
];

const downloadTemplate = () => {
  const csv = [TEMPLATE_HEADERS.join(","), TEMPLATE_SAMPLE_ROW.map((v) => `"${v}"`).join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nexora-product-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const BulkImport = () => {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [parseErrors, setParseErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setRows(res.data);
        setParseErrors(res.errors || []);
      },
      error: (err) => {
        toast.error("Couldn't read that file: " + err.message);
      },
    });
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const res = await productService.bulkImportProducts(rows);
      setResult(res.data.data);
      if (res.data.data.created > 0) toast.success(`${res.data.data.created} product(s) imported`);
      if (res.data.data.failed.length > 0) toast.error(`${res.data.data.failed.length} row(s) failed — see details below`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={15} /> Back to Products
      </Link>
      <h1 className="section-title mb-2">Bulk Import Products</h1>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        Upload a CSV file to create many products at once. Brand and category names in the
        CSV must already exist in your store — create them first under Categories/Brands if
        they're new.
      </p>

      <button onClick={downloadTemplate} className="btn-secondary mb-6">
        <Download size={15} /> Download CSV template
      </button>

      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center max-w-xl">
        <UploadCloud size={28} className="mx-auto text-muted mb-3" />
        <label className="btn-primary cursor-pointer inline-flex">
          Choose CSV file
          <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </label>
        {fileName && <p className="text-xs text-muted mt-3">{fileName} — {rows.length} row(s) found</p>}
      </div>

      {parseErrors.length > 0 && (
        <p className="text-xs text-accent mt-3">
          {parseErrors.length} row(s) had formatting issues and may not import correctly.
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="mt-6 max-w-3xl overflow-auto">
            <p className="text-sm font-medium mb-2">Preview (first 5 rows)</p>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2">Brand</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-2">{r.name}</td>
                    <td className="p-2">{r.sku}</td>
                    <td className="p-2">{r.brand}</td>
                    <td className="p-2">{r.category}</td>
                    <td className="p-2">{r.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleImport} disabled={importing} className="btn-primary mt-6">
            {importing ? "Importing..." : `Import ${rows.length} product(s)`}
          </button>
        </>
      )}

      {result && (
        <div className="mt-8 max-w-2xl">
          <div className="flex items-center gap-2 text-green-700 text-sm mb-2">
            <CheckCircle2 size={16} /> {result.created} product(s) created successfully
          </div>
          {result.failed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-accent text-sm mb-2">
                <XCircle size={16} /> {result.failed.length} row(s) failed
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-2">Row</th>
                      <th className="p-2">Product</th>
                      <th className="p-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failed.map((f, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="p-2">{f.row}</td>
                        <td className="p-2">{f.name}</td>
                        <td className="p-2 text-accent">{f.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkImport;