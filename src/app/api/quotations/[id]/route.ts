import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await db.quotation.findUnique({
      where: { id }
    });
    
    if (!result) {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    console.log(`[API] Updating quotation ID: ${id}`);
    
    const body = await request.json();
    const { quotationNo, clientName, totalAmount, data, date, status } = body;

    let parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        console.error(`[API] Invalid date received: ${date}`);
        parsedDate = new Date(); 
    }

    console.log('[API] Update Payload:', { quotationNo, clientName, totalAmount, date: parsedDate, status });

    const updatedQuotation = await db.quotation.update({
        where: { id },
        data: {
            quotationNo,
            clientName,
            totalAmount,
            date: parsedDate,
            data,
            status,
        }
    });

    return NextResponse.json(updatedQuotation);
  } catch (error: any) {
    if (error.code === 'P2025') {
        console.error(`[API] Quotation ID ${id} not found or update failed.`);
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }
    console.error('Error updating quotation:', error);
    return NextResponse.json({ error: 'Failed to update quotation: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.quotation.delete({
      where: { id }
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 });
  }
}
