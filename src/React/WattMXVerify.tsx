import React, { useEffect, useState } from 'react';
import { KJUR } from 'jsrsasign';

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyNezVUkIAVwTtxqOiaSP2GpcOmS8KPh6nplWH+8pKfRuJ4au8j4nUrsdBk4281kYW3Za3UB3BHOy4f3XXmvupr/+oqIsp4k/bFqqbZCChnysUHF+wRlehw+eZBsefNnE29sfkc/sbu+09aoGMNl9+QyC5IGmLoxcstU8oCWRxfZdDxrsDCoBXLeY0wwryvTJmR8ULWw+VHcdWJCf/WZKyBxHm6uXntmFs4IF6aRfLV0vy/By6JTK0XehuXt6zcXW1P6IlbZTqbsJq5SldEJ08K2iSXx8O04RiiLO3ylIawc8FqSHYxiF+lY2N9PFXefoZTvcrAiD5jyOo7rslVaYUQIDAQAB
-----END PUBLIC KEY-----`;

export const WattMXVerify = () => {
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        // Usamos regex para obtener los valores RAW de la URL (directamente del query string)
        // Esto es CRÍTICO porque URLSearchParams decodifica automáticamente (ej: %C3%A1 -> á)
        // Pero la App firmó el valor codificado.
        const getRawParam = (name: string) => {
            const match = window.location.search.match(new RegExp(`[?&]${name}=([^&]*)`));
            return match ? match[1] : '';
        };

        const id = getRawParam('id');
        const st = getRawParam('st'); // Mantenerlo como %C3%A1
        const tr = getRawParam('tr');
        const dt = getRawParam('dt');
        const kw = getRawParam('kw');
        const mt = getRawParam('mt');
        const h = getRawParam('h');
        const s = getRawParam('s');

        if (!s || !id) {
            setStatus('invalid');
            return;
        }

        try {
            // Reconstruimos la cadena EXACTA que firmó la App (usando valores raw)
            const dataToVerify = `${id}|${st}|${tr}|${dt}|${kw}|${mt}`;

            const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
            sig.init(PUBLIC_KEY_PEM);
            sig.updateString(dataToVerify);

            // Convertir base64url a hex
            const sigHex = Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('hex');

            if (sig.verify(sigHex)) {
                setStatus('valid');
                setData({ 
                    id, 
                    st: decodeURIComponent(st), // Decodificar solo para mostrar en pantalla
                    tr, kw, mt, h 
                });
            } else {
                setStatus('invalid');
            }
        } catch (e) {
            console.error(e);
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
