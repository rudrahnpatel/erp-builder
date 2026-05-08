import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId: slugParam } = await params;

    if (!slugParam) {
        return NextResponse.json({ error: 'Missing Public ID' }, { status: 400 });
    }

    const fullUuidMatch = slugParam.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
    const shortHexMatch = !fullUuidMatch && slugParam.match(/([a-f0-9]{8})$/i);

    if (!fullUuidMatch && !shortHexMatch) {
        return NextResponse.json({ error: 'Invalid share link' }, { status: 400 });
    }

    // In Prisma, we can't easily do string manipulation in WHERE like sql`REPLACE...`
    // Instead, we can fetch all and filter in memory if using short hex, but that's bad.
    // However, Prisma supports `startsWith` which won't work perfectly if dashes are omitted.
    // Fortunately, since shortHex is the first 8 chars, and UUIDs start with first 8 chars + dash,
    // we can use `startsWith` directly on the first 8 chars!
    const searchStr = fullUuidMatch ? fullUuidMatch[1] : shortHexMatch ? shortHexMatch[1].toLowerCase() : '';

    // Search Quotations
    const quote = await db.quotation.findFirst({
        where: fullUuidMatch 
            ? { publicId: searchStr }
            : { publicId: { startsWith: searchStr } }
    });
    
    if (quote) {
        return NextResponse.json({ type: 'Quotation', data: quote.data, meta: quote });
    }

    // Search Estimates
    const estimate = await db.estimate.findFirst({
        where: fullUuidMatch 
            ? { publicId: searchStr }
            : { publicId: { startsWith: searchStr } }
    });
    
    if (estimate) {
        return NextResponse.json({ type: 'Estimate', data: estimate.data, meta: estimate, isEstimate: true });
    }

    return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  } catch (error) {
    console.error('Error fetching public document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
