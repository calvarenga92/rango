package com.rango.rastreador.demo;

import com.rango.rastreador.pedido.ItemPedido;
import com.rango.rastreador.pedido.Pedido;
import com.rango.rastreador.pedido.PedidoRepository;
import com.rango.rastreador.pedido.StatusPedido;
import com.rango.rastreador.usuario.Usuario;
import com.rango.rastreador.usuario.UsuarioRepository;
import java.math.BigDecimal;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Conta de visitante e pedidos de exemplo, para quem abre o sistema só para conhecer.
 *
 * <p>Roda ao ligar a aplicação. A conta é criada se não existir; os pedidos, só com o
 * banco vazio. No plano gratuito do Render o disco não persiste entre reinícios, então
 * cada vez que o servidor liga o quadro volta a este estado inicial.
 *
 * <p>A conta não passa pelo cadastro (que exige e-mail e 8 caracteres): o login é curto
 * de propósito, para ser fácil de digitar. Desligada nos testes com {@code app.demo.ativo=false}.
 */
@Component
@ConditionalOnProperty(name = "app.demo.ativo", havingValue = "true")
public class DadosDemonstracao implements ApplicationRunner {

    static final String LOGIN = "teste";
    static final String SENHA = "123456";

    private static final Logger log = LoggerFactory.getLogger(DadosDemonstracao.class);

    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;

    public DadosDemonstracao(UsuarioRepository usuarioRepository,
                             PedidoRepository pedidoRepository,
                             PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.pedidoRepository = pedidoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!usuarioRepository.existsByEmail(LOGIN)) {
            usuarioRepository.save(new Usuario("Visitante", LOGIN, passwordEncoder.encode(SENHA)));
            log.info("Conta de demonstração criada");
        }

        if (pedidoRepository.count() == 0) {
            pedidoRepository.saveAll(pedidosDeExemplo());
            log.info("Pedidos de exemplo criados");
        }
    }

    private static List<Pedido> pedidosDeExemplo() {
        return List.of(
                pedido("Gustavo Pereira", "Rua Oscar Freire, 300, apto 12 — Jardins",
                        List.of(StatusPedido.EM_PREPARO, StatusPedido.SAIU_PARA_ENTREGA, StatusPedido.ENTREGUE),
                        item("Combo sushi 30 peças", 1, "92.40")),
                pedido("Fernanda Ribeiro", "Rua Teodoro Sampaio, 1020 — Pinheiros",
                        List.of(StatusPedido.CANCELADO),
                        item("Burrito", 1, "38.00")),
                pedido("Bruno Oliveira", "Rua Harmonia, 77 — Vila Madalena",
                        List.of(StatusPedido.EM_PREPARO, StatusPedido.SAIU_PARA_ENTREGA, StatusPedido.ENTREGUE),
                        item("Lasanha bolonhesa", 1, "52.00"), item("Pudim", 1, "12.70")),
                pedido("Camila Martins", "Alameda Santos, 455, sala 3 — Cerqueira César",
                        List.of(StatusPedido.EM_PREPARO, StatusPedido.SAIU_PARA_ENTREGA),
                        item("Yakisoba", 1, "34.90"), item("Guioza", 1, "6.00")),
                pedido("Rafael Almeida", "Rua Augusta, 980 — Consolação",
                        List.of(StatusPedido.EM_PREPARO, StatusPedido.SAIU_PARA_ENTREGA),
                        item("Poke de salmão", 2, "44.90")),
                pedido("Juliana Rocha", "Rua Cardeal Arcoverde, 1220, apto 81 — Pinheiros",
                        List.of(StatusPedido.EM_PREPARO),
                        item("Pizza calabresa", 1, "52.90"), item("Pizza quatro queijos", 1, "58.90"),
                        item("Refrigerante 2 L", 1, "12.00")),
                pedido("Lucas Ferreira", "Av. Paulista, 1500, bloco B — Bela Vista",
                        List.of(StatusPedido.EM_PREPARO),
                        item("Combo smash duplo", 1, "38.50"), item("Batata rústica", 1, "17.50")),
                pedido("Ana Beatriz Costa", "Rua Domingos de Morais, 2100 — Vila Mariana",
                        List.of(),
                        item("Açaí 500 ml", 1, "21.50"), item("Granola extra", 2, "3.00")),
                pedido("Pedro Henrique Lima", "Av. Brasil, 1890, casa 2 — Jardim América",
                        List.of(),
                        item("Missoshiru", 1, "15.60"), item("Temaki de salmão", 2, "27.90")),
                pedido("Mariana Souza", "Rua das Acácias, 245, apto 32 — Vila Mariana",
                        List.of(),
                        item("Pizza margherita", 1, "46.00"), item("Pizza calabresa", 1, "52.90"),
                        item("Guaraná 2 L", 1, "12.90")));
    }

    /** Monta o pedido e o leva pelo caminho de status, passando pela mesma regra da API. */
    private static Pedido pedido(String cliente, String endereco, List<StatusPedido> caminho, ItemPedido... itens) {
        Pedido pedido = new Pedido(cliente, endereco);
        for (ItemPedido item : itens) {
            pedido.adicionarItem(item);
        }
        caminho.forEach(pedido::alterarStatus);
        return pedido;
    }

    private static ItemPedido item(String descricao, int quantidade, String preco) {
        return new ItemPedido(descricao, quantidade, new BigDecimal(preco));
    }
}
