import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getWorkspace } from '@/lib/get-workspace';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allQuotations = await db.quotation.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: parseInt(limit) } : {})
    });

    return NextResponse.json(allQuotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quotationNo, clientName, totalAmount, data, date } = body;

    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const newQuotation = await db.quotation.create({
      data: {
        workspaceId: workspace.id,
        quotationNo,
        clientName,
        totalAmount,
        date: new Date(date),
        data,
        status: 'pending' // Default status
      }
    });

    return NextResponse.json(newQuotation);
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 });
  }
}
