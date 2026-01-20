import React, { useEffect, useState } from 'react';
import { KJUR } from 'jsrsasign';

const MI_LLAVE_PUBLICA_BASE64 = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr3UZio3jAG7F6ohI8tfoP4LWrX3aKLLqCSql3riFkjgbLPAL1EkxKJWZpTE2HXCKCw2y9Cbw94kOs6aOMWm86fK/3NtTJfMCAqAM9u5oPVixQKiu0XrWfWUK4KlMHBQDtl9XfefROlAfb3AaCp633R7iMDawjMtg29ZVkjvgMWQJKiORjommYJYGXjXM9eUjrafJTVn9OIZ1veVypwT5n1nKaHaBcfc8pzLJnhErrgebF6hZvmy8NaFMEnkplk7B62L11+KXuqv3jCyaevHaKha0futPeM8QVVUY9jM5KgmFZhOV9Aulw2MTi3QVc0lX9vx/i9aTpWLO2UZGk0zVlwIDAQAB`;
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
            const utf8tohex = (str) => {
                const utf8 = unescape(encodeURIComponent(str));
                let hex = '';
                for (let i = 0; i < utf8.length; i++) {
                    hex += utf8.charCodeAt(i).toString(16).padStart(2, '0');
                }
                return hex;
            };
            const dataHex = utf8tohex(dataToVerify);
            let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4 !== 0) b64 += '=';
            const sigHex = KJUR.crypto.Util.b64tohex(b64);

            const sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
            sig.init(PUBLIC_KEY_PEM);
            sig.updateHex(dataHex);

            if (sig.verify(sigHex)) {
                setStatus('valid');
                setData({ id, st, tr, kw, mt, h });
            } else {
                console.error('Firma no coincide para:', dataToVerify);
                setStatus('invalid');
            }
        } catch (e) { setStatus('invalid'); }
    }, []);

    if (status === 'loading') return <div className="text-white">Verificando...</div>;
    if (status === 'invalid') return (
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-2xl text-center">
            <h2 className="text-red-500 font-bold">Certificado No VÃ¡lido</h2>
            <p className="text-white/60 text-sm mt-2">Error de integridad criptogrÃ¡fica.</p>
        </div>
    );

    return (
        <div className="bg-emerald-500/10 border border-emerald-500 p-6 rounded-2xl">
            <h2 className="text-emerald-500 font-bold text-xl mb-4 text-center">âœ… Reporte AutÃ©ntico</h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/50">ID:</span><span className="text-white font-mono">{data.h}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/50">Contrato:</span><span className="text-white">{data.id}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/50">Consumo:</span><span className="text-white">{data.kw} kWh</span></div>
                <div className="flex justify-between"><span className="text-white/50">Total:</span><span className="text-white font-bold">${data.mt}</span></div>
            </div>
        </div>
    );
};
