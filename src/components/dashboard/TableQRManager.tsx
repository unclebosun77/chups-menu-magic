import { useState, useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Printer, QrCode, Plus, Minus } from "lucide-react";

interface TableQRManagerProps {
  restaurantId: string;
  restaurantName: string;
}

const APP_DOMAIN = window.location.origin;

const TableQRManager = ({ restaurantId, restaurantName }: TableQRManagerProps) => {
  const [tableCount, setTableCount] = useState(5);
  const printRef = useRef<HTMLDivElement>(null);

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const getTableUrl = (tableNumber: number) =>
    `${APP_DOMAIN}/restaurant/${restaurantId}?table=${tableNumber}`;

  const handleDownload = useCallback((tableNumber: number) => {
    const canvas = document.getElementById(`qr-table-${tableNumber}`) as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${restaurantName.replace(/\s+/g, "-")}-table-${tableNumber}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [restaurantName]);

  const handlePrintAll = useCallback(() => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Table QR Codes — ${restaurantName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            padding: 32px;
          }
          .card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            break-inside: avoid;
          }
          .card h3 {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .card h2 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 16px;
          }
          .card canvas {
            display: block;
            margin: 0 auto 12px;
          }
          .card p {
            font-size: 10px;
            color: #9ca3af;
            word-break: break-all;
          }
          @media print {
            .grid { padding: 16px; gap: 16px; }
            .card { border: 1px solid #d1d5db; padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="grid">
          ${printContent.innerHTML}
        </div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, [restaurantName]);

  return (
    <div className="space-y-6">
      {/* Table count control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Table QR Codes
          </CardTitle>
          <CardDescription>
            Generate QR codes for each table. Customers scan to open your menu linked to their table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="table-count" className="whitespace-nowrap">Number of tables</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTableCount(c => Math.max(1, c - 1))}
                disabled={tableCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="table-count"
                type="number"
                min={1}
                max={50}
                value={tableCount}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (v >= 1 && v <= 50) setTableCount(v);
                }}
                className="w-20 h-8 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTableCount(c => Math.min(50, c + 1))}
                disabled={tableCount >= 50}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={handlePrintAll} className="ml-auto">
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tables.map((num) => (
          <Card key={num} className="text-center">
            <CardContent className="pt-6 flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground">{restaurantName}</p>
              <p className="text-2xl font-bold">Table {num}</p>
              <QRCodeCanvas
                id={`qr-table-${num}`}
                value={getTableUrl(num)}
                size={160}
                level="M"
                includeMargin
              />
              <p className="text-[10px] text-muted-foreground break-all max-w-[180px]">
                {getTableUrl(num)}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleDownload(num)}
              >
                <Download className="h-3 w-3 mr-1.5" />
                Download PNG
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hidden print container with canvas QRs */}
      <div ref={printRef} className="hidden">
        {tables.map((num) => (
          <div key={num} className="card">
            <h3>{restaurantName}</h3>
            <h2>Table {num}</h2>
            <QRCodeCanvas
              value={getTableUrl(num)}
              size={140}
              level="M"
              includeMargin
            />
            <p>{getTableUrl(num)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableQRManager;
