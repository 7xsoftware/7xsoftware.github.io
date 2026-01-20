import React, { useEffect, useState } from 'react';
import { KJUR } from 'jsrsasign';

const MI_LLAVE_PUBLICA_BASE64 = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnLv3NU7cqtjNCSGWoNJ/FofxYJJ4Su37hC3mQQSEbJXenToUoEiZIwQJCqHzbddYXsOYWf6PqkuhNkoXP5jol0dxlcDPMUem9UeOL/eGpoUegC3HGqtcFkE8UXTci3Llp7rBDi4xmmmg4xmDqnd+Q0AWk0C5GXazZA06bM8hnX+n+6w3eVX1z4FqqnRldM4a8SDPwBMPivj6xd34s5HrCEZM7O6CqqOjiWxGpZXk4Vc4lO35x66j3Xd9HeUuv4+Go05OqnuTGOErpOIVbfXYWHphG+BeJSRI1/0CfeSTuw9VKkiaNQY69GbbVHLl8t/bBp7/b2PbdSnmT4WiuTAIDwIDAQAB`;

const formatPEM = (base64: string) => {
    const cleaned = base64.replace(/\s/g, '');
    const lines = cleaned.match(/.{1,64}/g) || [];
    return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
};

export const WattMXVerify = () => {
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [data, setData] = useState<any>(null);
    const [errorData, setErrorData] = useState<any>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || '';
        const st = params.get('st') || ''; 
        const tr = params.get('tr') || '';
        const dt = params.get('dt') || '';
        const kw = params.get('kw') || '';
        const mt = params.get('mt') || '';
        const h = params.get('h') || '';
        const s = params.get('s') || ''; 

        if (!s || !id) { setStatus('invalid'); return; }

        try {
            const dataToVerify = `${id}|${st}|${tr}|${dt}|${kw}|${mt}`;
            
            // Forzar codificacion UTF-8 idéntica a Java
            const encoder = new TextEncoder();
            const dataUint8 = encoder.encode(dataToVerify);
            const dataHex = Array.from(dataUint8).map(b => b.toString(16).padStart(2, '0')).join('');

            // Firma: Base64URL -> Hex
            let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4 !== 0) b64 += '=';
            const sigHex = KJUR.crypto.Util.b64tohex(b64);

            const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
            sig.init(formatPEM(MI_LLAVE_PUBLICA_BASE64));
            sig.updateHex(dataHex);

            if (sig.verify(sigHex)) {
                setStatus('valid');
                setData({ id, st, tr, kw, mt, h });
            } else {
                setErrorData({ data: dataToVerify, sigLen: s.length });
                setStatus('invalid');
            }
        } catch (e: any) {
            setErrorData({ error: e.message });
            setStatus('invalid');
        }
    }, []);

    if (status === 'loading') return <div className="text-white text-center p-10 font-sans animate-pulse">⚙️ Validando Seguridad...</div>;

    if (status === 'invalid') {
        return (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-3xl text-center shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-red-500 font-bold text-2xl tracking-tight">CERTIFICADO NO VÁLIDO</h2>
                    <p className="text-white/40 text-sm mt-3 leading-relaxed">La firma digital no coincide con los datos del reporte.</p>
                </div>
                {errorData && (
                    <div className="bg-black/60 border border-white/5 p-4 rounded-xl font-mono text-[9px] text-white/30 space-y-1">
                        <p>INPUT: {errorData.data}</p>
                        <p>SIG_SIZE: {errorData.sigLen} chars</p>
                        {errorData.error && <p>ERROR: {errorData.error}</p>}
                    </div>
                )}
                <div className="text-center pt-4">
                    <button onClick={() => window.close()} className="text-white/20 hover:text-white/60 text-xs transition-colors uppercase tracking-widest">Cerrar Verificador</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-8 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-25"></div>
                    <span className="text-emerald-500 text-4xl">✓</span>
                </div>
                <h2 className="text-emerald-500 font-black text-2xl tracking-tighter">REPORTE AUTÉNTICO</h2>
                <p className="text-emerald-500/50 text-[10px] uppercase tracking-[0.3em] mt-1">Integridad Verificada</p>
            </div>

            <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center group">
                    <span className="text-white/30 text-xs uppercase tracking-wider group-hover:text-white/50 transition-colors">Contrato</span>
                    <span className="text-white font-mono bg-white/10 px-3 py-1 rounded-lg text-sm">{data.id}</span>
                </div>
                <div className="flex justify-between items-center group">
                    <span className="text-white/30 text-xs uppercase tracking-wider group-hover:text-white/50 transition-colors">Estado</span>
                    <span className="text-white font-medium">{data.st}</span>
                </div>
                <div className="flex justify-between items-center group">
                    <span className="text-white/30 text-xs uppercase tracking-wider group-hover:text-white/50 transition-colors">Consumo</span>
                    <span className="text-white font-bold">{data.kw} <small className="text-white/40 font-normal">kWh</small></span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                    <span className="text-white/30 text-xs uppercase tracking-wider">Monto Validado</span>
                    <span className="text-emerald-400 font-black text-2xl leading-none">${data.mt}</span>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-500">
                <p className="text-[9px] text-white uppercase tracking-[0.4em]">ID Registro</p>
                <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-white/20"></div>
                    <p className="text-[10px] text-white font-mono">{data.h}</p>
                    <div className="h-px w-8 bg-white/20"></div>
                </div>
                <p className="text-[8px] text-white/50 italic font-light">Firmado con RSA-2048 & SHA-256</p>
            </div>
        </div>
    );
};
