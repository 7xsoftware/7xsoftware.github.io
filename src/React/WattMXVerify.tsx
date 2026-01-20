import React, { useEffect, useState } from 'react';
import { KJUR } from 'jsrsasign';

// LLAVE PÚBLICA SINCRONIZADA
const MI_LLAVE_PUBLICA_BASE64 = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvfkzb1nwxndsQhYNiQdC8USednbLK6IXOSZ5Ylc858yX86wjH6zCEsk23scTi8wk9fg2yNHbRIunWKLgRVkBLu8Lo4RgEc5Q0JWm37v5Q2nDpP+/1Jol8rytuyQKqhbvClajUT9uV80B0Qd0iM3zqqw7GKuQh7aDswOUCYv5EQ/9y1o16QpymsG+3CtJcvtSjfw48Xz2dgkOmU+PXb7MtD4+yamE+O12gVuZmzs5Wi9VJkELiOtq3ZPYytzyOiIh+tR98NWvb249Mg2a6qHSidmjgJ4zXRsX9LxDKh1tKtUORPq1igtVhrsDh+T2uEbFF1jU21PRRum0NxqMMSBNRwIDAQAB`;

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
            // 1. Reconstruir el mensaje original
            const dataToVerify = `${id}|${st}|${tr}|${dt}|${kw}|${mt}`;
            
            // 2. CORRECCIÓN DEFINITIVA: Convertir el string a bytes UTF-8 reales
            // Esta es la forma más fiable de que la 'á' coincida con Android
            const utf8tohex = (str: string) => {
                const utf8 = unescape(encodeURIComponent(str));
                let hex = "";
                for (let i = 0; i < utf8.length; i++) {
                    hex += utf8.charCodeAt(i).toString(16).padStart(2, '0');
                }
                return hex;
            };
            const dataHex = utf8tohex(dataToVerify);

            // 3. Preparar la firma (Base64URL -> Base64 -> Hex)
            let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4 !== 0) b64 += '=';
            const sigHex = KJUR.crypto.Util.b64tohex(b64);

            // 4. Validar
            const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
            sig.init(PUBLIC_KEY_PEM);
            sig.updateHex(dataHex);

            if (sig.verify(sigHex)) {
                setStatus('valid');
                setData({ id, st, tr, kw, mt, h });
            } else {
                console.group("WattMX Debug");
                console.log("Data:", dataToVerify);
                console.log("Hex:", dataHex);
                console.groupEnd();
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
