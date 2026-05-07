import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const allQuotations = await db.quotation.findMany({
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

    const newQuotation = await db.quotation.create({
      data: {
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
