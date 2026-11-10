import http from "node:http";
import {readFile, stat} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "public");
const port = Number(process.env.PORT || 3000);
const primary = "https://bicak-atlasi.pages.dev";
const types = {
  ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8",
  ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg", ".webp":"image/webp", ".ico":"image/x-icon",
  ".woff":"font/woff", ".woff2":"font/woff2", ".ttf":"font/ttf",
  ".txt":"text/plain; charset=utf-8", ".xml":"application/xml; charset=utf-8",
  ".map":"application/json; charset=utf-8"
};
const headers = {"X-Robots-Tag":"noindex, follow","X-Content-Type-Options":"nosniff"};
function send(res,status,body,type,method) {
  res.writeHead(status,{...headers,"Content-Type":type,"Content-Length":Buffer.byteLength(body)});
  if(method === "HEAD") return res.end();
  res.end(body);
}
http.createServer(async (req,res)=>{
  const method = req.method || "GET";
  if(method !== "GET" && method !== "HEAD"){
    res.writeHead(405,{...headers,Allow:"GET, HEAD"});return res.end();
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
    if(pathname.includes("\\") || pathname.includes("\u0000")) throw Error("Bad path");
  } catch {
    return send(res,400,"Bad request","text/plain; charset=utf-8",method);
  }
  if(pathname === "/robots.txt")
    return send(res,200,"User-agent: *\nAllow: /\n","text/plain; charset=utf-8",method);
  if(pathname === "/sitemap.xml")
    return send(res,404,"Not found","text/plain; charset=utf-8",method);
  let file = path.resolve(root,"."+pathname);
  if(file !== root && !file.startsWith(root+path.sep))
    return send(res,403,"Forbidden","text/plain; charset=utf-8",method);
  try {
    let info = await stat(file);
    if(info.isDirectory()){file=path.join(file,"index.html");info=await stat(file);}
    if(!info.isFile()) throw Error("Not a file");
    let data = await readFile(file);
    const ext = path.extname(file).toLowerCase();
    if(ext === ".html"){
      let html = data.toString("utf8");
      let route = pathname.replace(/\/index\.html$/,"/");
      if(!route.endsWith("/") && !path.extname(route)) route += "/";
      html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/>/i,'<meta name="robots" content="noindex, follow"/>');
      html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i,'<link rel="canonical" href="'+primary+route+'"/>');
      data = Buffer.from(html);
    }
    res.writeHead(200,{...headers,"Content-Type":types[ext]||"application/octet-stream","Content-Length":data.length,
      "Cache-Control":pathname.startsWith("/_next/static/")?"public, max-age=31536000, immutable":"public, max-age=300"});
    if(method==="HEAD") return res.end();
    res.end(data);
  } catch {
    send(res,404,"Not found","text/plain; charset=utf-8",method);
  }
}).listen(port,"0.0.0.0",()=>console.log("Bıçak Atlası listening on "+port));
