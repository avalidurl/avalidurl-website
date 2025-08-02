import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  const url = new URL(request.url);
  const contractAddress = url.searchParams.get('contract');
  const tokenId = url.searchParams.get('token');
  
  if (!contractAddress || !tokenId) {
    return new Response(JSON.stringify({ error: 'Missing contract or token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const apiKey = import.meta.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error('ALCHEMY_API_KEY not configured');
    }

    const response = await fetch(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      name: data.name || 'Untitled NFT',
      description: data.description || '',
      image: data.image?.cachedUrl || data.image?.originalUrl || '',
      externalUrl: data.externalUrl || '',
      contractAddress,
      tokenId
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
    
  } catch (error) {
    console.error('NFT API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch NFT data',
      contractAddress,
      tokenId
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};