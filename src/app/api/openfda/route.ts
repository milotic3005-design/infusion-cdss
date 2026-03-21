import { NextRequest } from 'next/server';
import { EXTERNAL_APIS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const drugName = searchParams.get('drugName');

  if (!drugName) {
    return Response.json({ error: 'drugName is required' }, { status: 400 });
  }

  const encodedName = encodeURIComponent(drugName);

  // Try generic name first, then brand name
  const queries = [
    `${EXTERNAL_APIS.openfda}?search=openfda.generic_name:"${encodedName}"&limit=1`,
    `${EXTERNAL_APIS.openfda}?search=openfda.brand_name:"${encodedName}"&limit=1`,
  ];

  for (const url of queries) {
    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return Response.json(data, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        }
      }
    } catch (error) {
      console.error('openFDA fetch attempt error:', error);
    }
  }

  // No results found from either query
  return Response.json({ meta: { results: { total: 0 } }, results: [] });
}
