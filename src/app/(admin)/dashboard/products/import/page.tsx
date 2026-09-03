"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Layers, DollarSign, Globe } from "lucide-react";
import { bulkImportProductsAction, ExcelProductInput } from "./actions";

export default function ExcelImportPage() {
  const [parsedProducts, setParsedProducts] = useState<ExcelProductInput[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sourceCurrency, setSourceCurrency] = useState<"PEN" | "USD">("PEN");
  const [exchangeRate, setExchangeRate] = useState<number>(3.75);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const mapped: ExcelProductInput[] = rawData.map((row) => {
          // Búsqueda flexible de columnas de la plantilla
          const sku = String(row["SKU"] || row["sku"] || "").trim();
          const uniqueId = String(row["ID Unico"] || row["ID Único"] || row["uniqueId"] || "").trim();
          const esFamiliaRaw = String(row["Es Familia"] || row["Es Familia (SI/NO)"] || row["isFamily"] || "").toUpperCase();
          const isFamily = esFamiliaRaw.includes("SI") || esFamiliaRaw === "TRUE" || esFamiliaRaw === "1";
          const familyId = String(row["ID Familia"] || row["familyId"] || "").trim();
          const title = String(row["Nombre"] || row["title"] || "").trim();
          const category = String(row["Categoria"] || row["Categoría"] || row["category"] || "General").trim();
          const costPerItem = parseFloat(String(row["Costo"] || row["cost"] || "0")) || 0;
          const basePrice = parseFloat(String(row["Precio Unitar"] || row["Precio Unitario"] || row["price"] || "0")) || 0;
          const imageUrl = String(row["URL Imagen"] || row["Imagen"] || row["imageUrl"] || "").trim();
          const productType = String(row["Tipo"] || row["productType"] || "").trim();

          return {
            sku,
            uniqueId,
            isFamily,
            familyId,
            title,
            category,
            costPerItem,
            basePrice,
            imageUrl,
            productType,
          };
        }).filter((p) => p.sku && p.title);

        setParsedProducts(mapped);
      } catch (err: any) {
        console.error("Error leyendo archivo Excel:", err);
        setStatusMessage({ type: "error", text: "Error al procesar el archivo Excel. Asegúrate de usar un formato .xlsx o .csv válido." });
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleStartImport = async () => {
    if (parsedProducts.length === 0) return;

    setIsUploading(true);
    setStatusMessage(null);

    const result = await bulkImportProductsAction(parsedProducts, sourceCurrency, exchangeRate);

    if (result.success) {
      setStatusMessage({ type: "success", text: result.message || "¡Importación exitosa a Neon DB!" });
      setParsedProducts([]);
      setFileName(null);
    } else {
      setStatusMessage({ type: "error", text: result.error || "Error al realizar la importación." });
    }

    setIsUploading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-body">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/products" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Productos</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Importador Masivo de Productos (Excel / CSV)</h1>
          <p className="text-sm text-slate-500">
            Especifica la moneda de origen de tus precios (PEN / USD) e importa masivamente tus productos a Neon DB.
          </p>
        </div>
      </div>

      {/* Configuración Previa de Moneda de Origen */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe className="w-4 h-4 text-slate-500" />
          <span>Configuración de Moneda del Excel</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ¿En qué moneda están ingresados los precios en tu Excel?
            </label>
            <div className="flex gap-4">
              <label className={`flex-1 p-3 rounded-lg border cursor-pointer text-xs font-semibold flex items-center gap-2 transition-all ${sourceCurrency === "PEN" ? "bg-purple-50 border-purple-300 text-purple-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                <input
                  type="radio"
                  name="currency"
                  value="PEN"
                  checked={sourceCurrency === "PEN"}
                  onChange={() => setSourceCurrency("PEN")}
                  className="accent-purple-600"
                />
                <div>
                  <span className="block font-bold">PEN (Soles S/.)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Convertirá automáticamente a USD base</span>
                </div>
              </label>

              <label className={`flex-1 p-3 rounded-lg border cursor-pointer text-xs font-semibold flex items-center gap-2 transition-all ${sourceCurrency === "USD" ? "bg-purple-50 border-purple-300 text-purple-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                <input
                  type="radio"
                  name="currency"
                  value="USD"
                  checked={sourceCurrency === "USD"}
                  onChange={() => setSourceCurrency("USD")}
                  className="accent-purple-600"
                />
                <div>
                  <span className="block font-bold">USD (Dólares $)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Los precios ya están en USD</span>
                </div>
              </label>
            </div>
          </div>

          {sourceCurrency === "PEN" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tasa de Cambio Aplicada (Soles por 1 USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.0001"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 3.75)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Ejemplo: Si un producto cuesta S/. 40.00 en Excel, se guardará como ${(40 / exchangeRate).toFixed(2)} USD base.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Carga del Archivo Excel */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors bg-slate-50/50">
          <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm mb-1">
            {fileName ? `Archivo cargado: ${fileName}` : "Selecciona tu plantilla de Excel (.xlsx / .csv)"}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Detecta automáticamente las columnas: SKU, ID Unico, Es Familia, ID Familia, Nombre, Categoria, Costo, Precio Unitario, URL Imagen, Tipo.
          </p>

          <label className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            <span>Examinar Archivo</span>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-lg flex items-center gap-3 text-xs font-semibold ${statusMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
            {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Previsualización con Precios Convertidos */}
      {parsedProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Previsualización ({parsedProducts.length} filas leídas en {sourceCurrency === "PEN" ? "Soles S/." : "Dólares $"})
              </h3>
              <p className="text-xs text-slate-500">
                Los precios de venta se convertirán a la base de datos según la moneda seleccionada.
              </p>
            </div>

            <button
              onClick={handleStartImport}
              disabled={isUploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>CONFIRMAR E IMPORTAR {parsedProducts.length} PRODUCTOS</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">SKU / ID Único</th>
                  <th className="px-4 py-3">Nombre del Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Familia (SI/NO)</th>
                  <th className="px-4 py-3">Precio en Excel</th>
                  <th className="px-4 py-3">Precio Base (USD)</th>
                  <th className="px-4 py-3">Costo Base (USD)</th>
                  <th className="px-4 py-3">Imagen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {parsedProducts.map((p, idx) => {
                  const priceInUSD = sourceCurrency === "PEN" ? p.basePrice / exchangeRate : p.basePrice;
                  const costInUSD = p.costPerItem ? (sourceCurrency === "PEN" ? p.costPerItem / exchangeRate : p.costPerItem) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{p.sku}</td>
                      <td className="px-4 py-3 font-sans font-semibold text-slate-900">{p.title}</td>
                      <td className="px-4 py-3">{p.category}</td>
                      <td className="px-4 py-3">
                        {p.isFamily ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {p.familyId || "SI"}
                          </span>
                        ) : (
                          <span className="text-slate-400">NO</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-purple-700">
                        {sourceCurrency === "PEN" ? `S/. ${p.basePrice.toFixed(2)}` : `$${p.basePrice.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">${priceInUSD.toFixed(2)} USD</td>
                      <td className="px-4 py-3 text-slate-500">${costInUSD.toFixed(2)} USD</td>
                      <td className="px-4 py-3 text-[11px] text-slate-400 truncate max-w-[120px]">
                        {p.imageUrl ? "Con Imagen" : "Sin URL"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
