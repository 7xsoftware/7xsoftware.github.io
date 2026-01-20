import React, { useEffect, useState } from 'react';
import { KJUR } from 'jsrsasign';

// Llave cargada por el Sincronizador Maestro
const MI_LLAVE_PUBLICA_BASE64 = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnLv3NU7cqtjNCSGWoNJ/FofxYJJ4Su37hC3mQQSEbJXenToUoEiZIwQJCqHzbddYXsOYWf6PqkuhNkoXP5jol0dxlcDPMUem9UeOL/eGpoUegC3HGqtcFkE8UXTci3Llp7rBDi4xmmmg4xmDqnd+Q0AWk0C5GXazZA06bM8hnX+n+6w3eVX1z4FqqnRldM4a8SDPwBMPivj6xd34s5HrCEZM7O6CqqOjiWxGpZXk4Vc4lO35x66j3Xd9HeUuv4+Go05OqnuTGOErpOIVbfXYWHphG+BeJSRI1/0CfeSTuw9VKkiaNQY69GbbVHLl8t/bBp7/b2PbdSnmT4WiuTAIDwIDAQAB`;

// Funcion para formatear la llave correctamente
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
            const dataToVerify = `${id}|${st}|${tr}|${dt}|${kw}|${mt}`;
            setDebug(dataToVerify);

            // Conversion a HEX para maxima precision
            const dataHex = Array.from(new TextEncoder().encode(dataToVerify))
                                .map(b => b.toString(16).padStart(2, '0'))
                                .join('');

            // Preparar firma (Base64URL -> Base64 -> Hex)
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
            console.error(e);
            setStatus('invalid');
        }
    }, []);

    if (status === 'loading') return <div className="text-white font-sans animate-pulse">Verificando integridad...</div>;

    if (status === 'invalid') {
        return (
            <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500 p-6 rounded-2xl text-center font-sans">
                    <h2 className="text-red-500 font-bold text-xl">Certificado No Valido</h2>
                    <p className="text-white/60 text-sm mt-2">Falla de firma criptografica.</p>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] text-white/40 font-mono break-all">
                    DEBUG: {debug}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-emerald-500/10 border border-emerald-500 p-6 rounded-2xl font-sans shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <h2 className="text-emerald-500 font-bold text-xl mb-4 text-center">✅ Reporte Autentico</h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/60">Contrato:</span><span className="text-white font-medium">{data.id}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/60">Estado:</span><span className="text-white">{data.st}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/60">Consumo:</span><span className="text-white">{data.kw} kWh</span></div>
                <div className="flex justify-between"><span className="text-white/60">Total Pago:</span><span className="text-emerald-400 font-bold">${data.mt}</span></div>
            </div>
        </div>
    );
};
