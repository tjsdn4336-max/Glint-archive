import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface ReportBody {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  instagram?: string;
  phone?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReportBody;

    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: '샵 이름과 주소는 필수입니다.' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('shops') as any).insert({
      name:        body.name,
      address:     body.address,
      location:    body.address.split(' ').slice(0, 2).join(' '),
      lat:         body.lat ?? null,
      lng:         body.lng ?? null,
      instagram:   body.instagram ?? null,
      phone:       body.phone ?? null,
      source:      'user_report',
      status:      'pending',
      is_verified: false,
      is_open:     false,
      plan:        'basic',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
