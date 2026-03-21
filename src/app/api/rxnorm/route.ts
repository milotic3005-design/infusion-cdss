import { NextRequest } from 'next/server';
import { EXTERNAL_APIS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');
  const name = searchParams.get('name');
  const rxcui = searchParams.get('rxcui');
  const drugName = searchParams.get('drugName');

  let url: string;

  switch (action) {
    case 'search':
      if (!name) return Response.json({ error: 'name is required' }, { status: 400 });
      url = `${EXTERNAL_APIS.rxnorm}/drugs.json?name=${encodeURIComponent(name)}`;
      break;

    case 'related':
      if (!rxcui) return Response.json({ error: 'rxcui is required' }, { status: 400 });
      url = `${EXTERNAL_APIS.rxnorm}/rxcui/${encodeURIComponent(rxcui)}/related.json?tty=IN`;
      break;

    case 'class':
      if (!drugName) return Response.json({ error: 'drugName is required' }, { status: 400 });
      url = `${EXTERNAL_APIS.rxnorm}/rxclass/class/byDrugName.json?drugName=${encodeURIComponent(drugName)}`;
      break;

    case 'interactions':
      if (!rxcui) return Response.json({ error: 'rxcui is required' }, { status: 400 });
      url = `${EXTERNAL_APIS.rxnorm}/interaction/interaction.json?rxcui=${encodeURIComponent(rxcui)}`;
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
        { error: `RxNorm API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('RxNorm proxy error:', error);
    return Response.json({ error: 'Failed to fetch from RxNorm' }, { status: 502 });
  }
}
