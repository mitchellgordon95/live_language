import { NextResponse } from 'next/server';
import { getModule, updateModule } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mod = await getModule(id);
    if (!mod) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    return NextResponse.json(mod);
  } catch (error) {
    console.error('Get module error:', error);
    return NextResponse.json({ error: 'Failed to get module' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.moduleData !== undefined) updates.moduleData = body.moduleData;
    if (body.assetStatus !== undefined) updates.assetStatus = body.assetStatus;
    if (body.status !== undefined) updates.status = body.status;

    await updateModule(id, updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Update module error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update module' },
      { status: 500 },
    );
  }
}
