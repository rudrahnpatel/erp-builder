import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await db.estimate.findUnique({
      where: { id }
    });

    if (!result) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }

    const responseData = {
        ...(result.data as any),
        id: result.id, 
        createdAt: result.createdAt,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return NextResponse.json({ error: 'Failed to fetch estimate' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { billNo, billDate, totalAmount, paidAmount, status, ...data } = body;

    const updatedEstimate = await db.estimate.update({
      where: { id },
      data: {
        billNo,
        billDate: new Date(billDate),
        clientName: body.billTo,
        totalAmount,
        paidAmount,
        status: status || 'pending',
        data: body,
      }
    });

    return NextResponse.json(updatedEstimate);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }
    console.error('Error updating estimate:', error);
    return NextResponse.json({ error: 'Failed to update estimate' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.estimate.delete({
      where: { id }
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting estimate:', error);
    return NextResponse.json({ error: 'Failed to delete estimate' }, { status: 500 });
  }
}
