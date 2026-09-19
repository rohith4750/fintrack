import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        orders: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if creating product or order
    if (body.type === "ORDER") {
      const count = await prisma.productFinanceOrder.count();
      const orderNumber = body.orderNumber || `PFO-2026-${String(count + 85).padStart(3, "0")}`;

      const order = await prisma.productFinanceOrder.create({
        data: {
          orderNumber,
          productId: body.productId,
          productName: body.productName,
          category: body.category || "MOBILE",
          customerId: body.customerCode || body.customerId,
          productCost: Number(body.productCost),
          sellingPrice: Number(body.sellingPrice),
          downPayment: Number(body.downPayment),
          financedAmount: Number(body.financedAmount),
          profitMargin: Number(body.profitMargin),
          tenureMonths: Number(body.tenureMonths),
          monthlyEmi: Number(body.monthlyEmi),
          orderDate: body.orderDate || "2026-09-20",
          serialNumber: body.serialNumber,
          status: "ACTIVE",
        },
      });

      return NextResponse.json({ success: true, order });
    }

    const sku = body.sku || `PROD-${Date.now().toString().slice(-4)}`;
    const product = await prisma.product.create({
      data: {
        sku: sku.toUpperCase(),
        name: body.name,
        category: body.category,
        brand: body.brand || "Brand",
        productCost: Number(body.productCost),
        sellingPrice: Number(body.sellingPrice),
        stockQuantity: Number(body.stockQuantity) || 5,
        standardDownPayment: Number(body.standardDownPayment) || 5000,
        standardTenureMonths: Number(body.standardTenureMonths) || 12,
        status: "IN_STOCK",
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
