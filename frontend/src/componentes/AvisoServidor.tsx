import { useEffect, useState } from 'react';
import { servidor } from '../api/client';

/**
 * Faixa exibida enquanto a API está ligando (o plano gratuito do Render
 * desliga depois de um tempo parado). Também acorda a API ao abrir a página
 * e ao voltar para a aba, para ela já estar de pé no primeiro clique.
 */
export function AvisoServidor() {
  const [ligando, setLigando] = useState(false);

  useEffect(() => servidor.ouvir(setLigando), []);

  useEffect(() => {
    servidor.acordar();
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') servidor.acordar();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => document.removeEventListener('visibilitychange', aoVoltar);
  }, []);

  if (!ligando) return null;

  return (
    <div className="aviso-servidor" role="status" aria-live="polite">
      <span className="aviso-servidor__giro" aria-hidden="true" />
      <div>
        <strong>Ligando o servidor…</strong>
        <p>Ficou parado um tempo. Leva até 1 minuto e depois fica rápido.</p>
      </div>
    </div>
  );
}
