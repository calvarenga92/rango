import { Icone } from './Icone';

export function Marca() {
  return (
    <div className="marca">
      <span className="marca__logo">
        <Icone nome="marca" tamanho={20} />
      </span>
      <span className="marca__texto">
        <strong>
          rango<span className="marca__ponto">.</span>
        </strong>
        <small>Rastreador de pedidos</small>
      </span>
    </div>
  );
}
