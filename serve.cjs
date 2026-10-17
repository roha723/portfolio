'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 const relative=path.relative(root,file);
 if(relative.startsWith('..')||path.isAbsolute(relative)||!types[path.extname(file)]){res.writeHead(403);res.end();return;}
 fs.readFile(file,(error,body)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)],'Referrer-Policy':'strict-origin-when-cross-origin','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(body);});
});
server.on('error',error=>{console.error('Could not start portfolio:',error.message);process.exitCode=1;});
if(require.main===module){server.listen(0,'127.0.0.1',()=>{const url=`http://127.0.0.1:${server.address().port}`;console.log(`Portfolio: ${url}\nKeep this window open while viewing. Close it to stop.`);const browser=require('node:child_process').spawn('explorer.exe',[url],{stdio:'ignore'});browser.on('error',()=>console.log('Open the URL above in your browser.'));browser.unref();});}
module.exports=server;
