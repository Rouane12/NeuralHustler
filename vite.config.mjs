import { defineConfig } from "vite";

// Development only. Production remains the committed static HTML on GitHub Pages.
// The iframe gives each QA preset a real CSS viewport without altering site styles.
export default defineConfig({
  server: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
  plugins: [{
    name: "responsive-review",
    configureServer(server) {
      server.middlewares.use("/__qa", (_request, response) => {
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end([
          '<!doctype html><html lang="en"><head><meta charset="utf-8">',
          '<meta name="robots" content="noindex"><title>Neural Hustle responsive review</title>',
          '<style>body{margin:0;background:#222;color:white;font:14px system-ui}header{padding:12px;display:flex;gap:16px;align-items:center}select,button{font:inherit;padding:8px}iframe{display:block;border:0;background:#05060a;margin:0 auto;transform-origin:top center}main{overflow:clip}</style></head><body>',
          '<header><label>Viewport <select id="viewport"><option value="1920">Large desktop · 1920</option><option value="1366" selected>Laptop · 1366</option><option value="820">Tablet · 820</option><option value="390">Mobile · 390</option><option value="320">Small mobile · 320</option></select></label>',
          '<label>Text size <select id="text"><option value="100">100%</option><option value="200">200%</option></select></label>',
          '<button id="top">Back to top</button><span id="measure"></span></header>',
          '<main><iframe id="site" title="Website under review" src="/" width="1366" height="900"></iframe></main>',
          '<script>const frame=document.querySelector("#site");const preset=document.querySelector("#viewport");',
          'function size(){const width=Number(preset.value);frame.style.width=width+"px";const scale=Math.min(1,(innerWidth-24)/width);frame.style.transform="scale("+scale+")";frame.style.height=(width<900?820:900)+"px";document.querySelector("#measure").textContent=width+" CSS px";}',
          'preset.addEventListener("change",size);window.addEventListener("resize",size);document.querySelector("#text").addEventListener("change",e=>{frame.contentDocument.documentElement.style.fontSize=e.target.value+"%"});document.querySelector("#top").addEventListener("click",()=>frame.contentWindow.scrollTo({top:0,behavior:"instant"}));size();</script>',
          '</body></html>'
        ].join(""));
      });
    }
  }]
});
