(() => {
  // src/index.ts
  var BUCKET_URL = "https://pwac-media.s3.eu-north-1.amazonaws.com";
  var DOMAIN_MAPPING_API_URL = "https://pwac.world/domain-mapping";
  addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
  });
  async function handleRequest(request) {
    try {
      const url = new URL(request.url);
      const domainName = url.hostname;
      const mappingResponse = await fetch(
        `${DOMAIN_MAPPING_API_URL}/${domainName}`
      );
      if (!mappingResponse.ok) {
        return new Response("Domain mapping not found", { status: 404 });
      }
      const { pwaId } = await mappingResponse.json();
      if (!pwaId) {
        return new Response("PWA ID not found for the domain", { status: 404 });
      }
      const fileUrl = `${BUCKET_URL}/${pwaId}/index.html`;
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        return new Response("File not found", { status: 404 });
      }
      return new Response(fileResponse.body, {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "public, max-age=3600"
        },
        status: fileResponse.status
      });
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }
})();
//# sourceMappingURL=index.js.map
