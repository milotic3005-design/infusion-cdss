import { NextRequest } from 'next/server';
import { EXTERNAL_APIS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');
  const drugName = searchParams.get('drugName');
  const setid = searchParams.get('setid');

  let url: string;

  switch (action) {
    case 'list':
      if (!drugName) return Response.json({ error: 'drugName is required' }, { status: 400 });
      url = `${EXTERNAL_APIS.dailymed}/spls.json?drug_name=${encodeURIComponent(drugName)}&pagesize=5`;
      break;

    case 'content':
      if (!setid) return Response.json({ error: 'setid is required' }, { status: 400 });
      url = `${EXTERNAL_APIS.dailymed}/spls/${encodeURIComponent(setid)}.xml`;
      break;

    default:
      return Response.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return Response.json(
        { error: `DailyMed API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    if (action === 'content') {
      // Return XML as text
      const text = await response.text();
      return new Response(text, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    const data = await response.json();
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('DailyMed proxy error:', error);
    return Response.json({ error: 'Failed to fetch from DailyMed' }, { status: 502 });
  }
}
