import { useState } from 'react';


export default function Connected(){
const [file, setFile] = useState<File|null>(null);
const [url, setUrl] = useState('');
const [msg, setMsg] = useState('');


async function sendFile(){
if(!file) return;
const fd = new FormData();
fd.append('video', file);
const r = await fetch('/api/tiktok/upload', { method:'POST', body: fd });
const j = await r.json();
setMsg(JSON.stringify(j));
}
async function sendUrl(){
if(!url) return;
const r = await fetch('/api/tiktok/upload-from-url', {
method:'POST',
headers:{ 'Content-Type':'application/json' },
body: JSON.stringify({ url })
});
const j = await r.json();
setMsg(JSON.stringify(j));
}


return (
<main style={{padding:24,fontFamily:'Inter,system-ui',maxWidth:760,margin:'0 auto'}}>
<h1>Connecté ✔</h1>
<p>Testez un upload en brouillon : fichier local ou URL publique.</p>


<h2>Upload fichier</h2>
<input type="file" accept="video/mp4,video/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
<button onClick={sendFile} style={{marginLeft:8}}>Envoyer</button>


<h2 style={{marginTop:24}}>Upload depuis URL</h2>
<input style={{width:'100%'}} placeholder="https://.../video.mp4" value={url} onChange={e=>setUrl(e.target.value)} />
<button onClick={sendUrl} style={{marginTop:8}}>Envoyer</button>


<pre style={{background:'#111',color:'#0f0',padding:12,marginTop:24,overflow:'auto'}}>{msg}</pre>
</main>
);
}