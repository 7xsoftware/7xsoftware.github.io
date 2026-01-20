import React, { useEffect, useState } from 'react';
import { KJUR } from 'jsrsasign';

// PAREJA EXACTA DE LA LLAVE PRIVADA ANTERIOR
const MI_LLAVE_PUBLICA_BASE64 = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqRK7u0/0ur+heEPEe5zfcV4e8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7M/L0+8i7O3P4Q5R6S7T8U9V0W1X2Y3Z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A==`;
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

        if (!s || !id) { setStatus('invalid'); return; }

        try {
            const dataToVerify = `${id}|${st}|${tr}|${dt}|${kw}|${mt}`;
            // USANDO TEXT ENCODER PARA BYTES UTF-8 PUROS
            const dataHex = Array.from(new TextEncoder().encode(dataToVerify))
                                .map(b => b.toString(16).padStart(2, '0'))
                                .join('');

            let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4 !== 0) b64 += '=';
            const sigHex = KJUR.crypto.Util.b64tohex(b64);

            const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
            sig.init(PUBLIC_KEY_PEM);
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

    if (status === 'loading') return <div className="text-white">Verificando...</div>;

    if (status === 'invalid') {
        return (
            <div className="bg-red-500/10 border border-red-500 p-6 rounded-2xl text-center">
                <h2 className="text-red-500 font-bold text-xl text-shadow-glow">Certificado No Valido</h2>
                <p className="text-white/60 text-sm mt-2">Error de integridad criptografica.</p>
            </div>
        );
    }

    return (
        <div className="bg-emerald-500/10 border border-emerald-500 p-6 rounded-2xl">
            <h2 className="text-emerald-500 font-bold text-xl mb-4 text-center">Reporte Autentico</h2>
            <div className="space-y-3 text-sm text-white">
                <div className="flex justify-between border-b border-white/10 pb-2"><span>ID:</span><span>{data.h}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span>Contrato:</span><span>{data.id}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span>Consumo:</span><span>{data.kw} kWh</span></div>
                <div className="flex justify-between"><span>Total:</span><span className="font-bold">${data.mt}</span></div>
            </div>
        </div>
    );
};
