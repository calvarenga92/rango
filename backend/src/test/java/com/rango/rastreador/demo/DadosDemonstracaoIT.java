package com.rango.rastreador.demo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

// Banco próprio: os pedidos de exemplo não podem vazar para os outros testes.
@SpringBootTest(properties = {
        "app.demo.ativo=true",
        "spring.datasource.url=jdbc:sqlite:target/rastreador-demo-teste.db"
})
@AutoConfigureMockMvc
class DadosDemonstracaoIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("visitante entra com a conta de demonstração e encontra o quadro preenchido")
    void visitanteEntraEVePedidos() throws Exception {
        String resposta = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","senha":"%s"}"""
                                .formatted(DadosDemonstracao.LOGIN, DadosDemonstracao.SENHA)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode corpo = objectMapper.readTree(resposta);

        mockMvc.perform(get("/api/pedidos")
                        .header("Authorization", "Bearer " + corpo.get("token").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(10));
    }
}
