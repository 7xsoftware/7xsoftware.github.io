import React, { useEffect, useState } from 'react';
import { KJUR } from 'jsrsasign';

// Llave sincronizada (Mismo par que local.properties)
const MI_LLAVE_PUBLICA_BASE64 = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnLv3NU7cqtjNCSGWoNJ/FofxYJJ4Su37hC3mQQSEbJXenToUoEiZIwQJCqHzbddYXsOYWf6PqkuhNkoXP5jol0dxlcDPMUem9UeOL/eGpoUegC3HGqtcFkE8UXTci3Llp7rBDi4xmmmg4xmDqnd+Q0AWk0C5GXazZA06bM8hnX+n+6w3eVX1z4FqqnRldM4a8SDPwBMPivj6xd34s5HrCEZM7O6CqqOjiWxGpZXk4Vc4lO35x66j3Xd9HeUuv4+Go05OqnuTGOErpOIVbfXYWHphG+BeJSRI1/0CfeSTuw9VKkiaNQY69GbbVHLl8t/bBp7/b2PbdSnmT4WiuTAIDwIDAQAB`;

const formatPEM = (base64: string) => {
    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
};

export const WattMXVerify = () => {
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [data, setData] = useState<any>(null);
    const [debug, setDebug] = useState<string>('');

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
            // El debug ahora te mostrara la cadena que Android firma
            const dataToVerify = `${id}|${st}|${tr}|${dt}|${kw}|${mt}`;
            setDebug(dataToVerify);

            const dataHex = Array.from(new TextEncoder().encode(dataToVerify))
                                .map(b => b.toString(16).padStart(2, '0'))
                                .join('');

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
                setStatus('invalid');
            }
        } catch (e) {
            setStatus('invalid');
        }
    }, []);

    if (status === 'loading') return (
        <div className="flex flex-col items-center justify-center min-h-[200px] font-sans">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/80 animate-pulse">Verificando seguridad WattMX...</p>
        </div>
    );

    if (status === 'invalid') {
        return (
            <div className="space-y-4 font-sans animate-in fade-in duration-500">
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
                    <h2 className="text-red-500 font-bold text-xl uppercase tracking-wider">Certificado No Valido</h2>
                    <p className="text-white/60 text-sm mt-2">Error de integridad criptografica.</p>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] text-white/40 font-mono break-all leading-relaxed">
                    <span className="text-red-500/50 mr-2">LOG:</span>{debug}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-emerald-500/10 border border-emerald-500/50 p-6 rounded-2xl font-sans shadow-[0_0_50px_rgba(16,185,129,0.1)] animate-in zoom-in duration-500">
            <h2 className="text-emerald-500 font-bold text-xl mb-6 text-center tracking-tight flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                Reporte Autentico
            </h2>
            <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/40">Contrato</span>
                    <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{data.id}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/40">Ubicacion</span>
                    <span className="text-white uppercase">{data.st}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/40">Consumo Total</span>
                    <span className="text-white font-medium">{data.kw} kWh</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-white/40">Pago Validado</span>
                    <span className="text-emerald-400 font-bold text-lg">${data.mt}</span>
                </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 flex flex-col items-center gap-1">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">Hash de Verificacion</p>
                <p className="text-[10px] text-white/40 font-mono italic">{data.h}</p>
            </div>
        </div>
    );
};
