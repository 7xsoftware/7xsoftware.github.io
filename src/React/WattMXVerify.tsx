import React, { useEffect, useState } from 'react';
import { KJUR } from 'jsrsasign';

// ⚠️ REEMPLAZA ESTA CADENA con la "PUBLIC KEY (Base64)" que generó tu programa KeyGen.java
const MI_LLAVE_PUBLICA_BASE64 = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyNezVUkIAVwTtxqOiaSP2GpcOmS8KPh6nplWH+8pKfRuJ4au8j4nUrsdBk4281kYW3Za3UB3BHOy4f3XXmvupr/+oqIsp4k/bFqqbZCChnysUHF+wRlehw+eZBsefNnE29sfkc/sbu+09aoGMNl9+QyC5IGmLoxcstU8oCWRxfZdDxrsDCoBXLeY0wwryvTJmR8ULWw+VHcdWJCf/WZKyBxHm6uXntmFs4IF6aRfLV0vy/By6JTK0XehuXt6zcXW1P6IlbZTqbsJq5SldEJ08K2iSXx8O04RiiLO3ylIawc8FqSHYxiF+lY2N9PFXefoZTvcrAiD5jyOo7rslVaYUQIDAQAB`;

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----\n${MI_LLAVE_PUBLICA_BASE64}\n-----END PUBLIC KEY-----`;

export const WattMXVerify = () => {
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [data, setData] = useState<any>(null);

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

        if (!s || !id) {
            setStatus('invalid');
            return;
        }

        try {
            // 1. Reconstruir la cadena original (idéntica a Android)
            const dataToVerify = `${id}|${st}|${tr}|${dt}|${kw}|${mt}`;
            
            // 2. Preparar la firma (Base64URL -> Base64 -> Hex)
            let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4 !== 0) b64 += '=';
            const sigHex = KJUR.crypto.Util.b64tohex(b64);

            // 3. Validar usando UTF-8 explícito
            const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
            sig.init(PUBLIC_KEY_PEM);
            sig.updateString(dataToVerify);

            if (sig.verify(sigHex)) {
                setStatus('valid');
                setData({ id, st, tr, kw, mt, h });
            } else {
                console.error("Mismatched Signature. Data string was:", dataToVerify);
                setStatus('invalid');
            }
        } catch (e) {
            console.error("Cripto Error:", e);
            setStatus('invalid');
        }
    }, []);

    if (status === 'loading') return <div className="text-white animate-pulse font-sans">Verificando firma digital...</div>;

    if (status === 'invalid') {
        return (
            <div className="bg-red-500/10 border border-red-500 p-6 rounded-2xl text-center font-sans">
                <h2 className="text-red-500 font-bold text-xl">Certificado No Válido</h2>
                <p className="text-white/60 text-sm mt-2">Este reporte no ha sido firmado por WattMX o ha sido modificado.</p>
            </div>
        );
    }

    return (
        <div className="bg-emerald-500/10 border border-emerald-500 p-6 rounded-2xl font-sans">
            <h2 className="text-emerald-500 font-bold text-xl mb-4 text-center">✅ Reporte Auténtico</h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">ID Verificación:</span>
                    <span className="text-white font-mono">{data.h}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">Contrato:</span>
                    <span className="text-white">{data.id}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">Consumo:</span>
                    <span className="text-white">{data.kw} kWh</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/50">Total:</span>
                    <span className="text-white font-bold">${data.mt}</span>
                </div>
            </div>
            <p className="mt-4 text-[10px] text-center text-white/30 italic">Validado criptográficamente mediante RSA-2048</p>
        </div>
    );
};
