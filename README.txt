PUT THESE FILES IN YOUR GITHUB PAGES SITE

1. Upload manifest.json next to index.html.
2. Upload sw.js next to index.html.
3. Upload the icons folder with icon-192.png and icon-512.png.

ADD TO index.html INSIDE <head>:
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#1468e8">
<link rel="apple-touch-icon" href="icons/icon-192.png">

ADD BEFORE </body>:
<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  });
}
</script>

The service worker does not cache Supabase requests, so live warnings can continue updating.
