import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await db.estimate.findMany({
      orderBy: { billDate: 'desc' }
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching estimates:', error);
    return NextResponse.json({ error: 'Failed to fetch estimates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { billNo, billDate, clientName, totalAmount, paidAmount, status, ...data } = body;

    const newEstimate = await db.estimate.create({
      data: {
        billNo,
        billDate: new Date(billDate),
        clientName: body.billTo, // Mapping billTo from frontend to clientName
        totalAmount,
        paidAmount: paidAmount || 0,
        status: status || 'pending',
        data: body, // Store the full body as JSON for flexibility
      }
    });

    return NextResponse.json(newEstimate);
  } catch (error: any) {
    console.error('Error creating estimate:', error);
    return NextResponse.json({ error: 'Failed to create estimate' }, { status: 500 });
  }
}
