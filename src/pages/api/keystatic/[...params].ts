export async function ALL() {
  return new Response(JSON.stringify({
    message: "Keystatic API not available in production. Use local development for content editing."
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
