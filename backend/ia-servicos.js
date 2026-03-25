const gerarPromptDiagnostico = (usuario, analise, cardapio, dificuldades) => {
    return ` ... todo o conteúdo do prompt ... `;
};

const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function solicitarAnaliseIA(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Você é um especialista em finanças empresariais." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Erro OpenAI:", error);
        return "Erro ao analisar dados.";
    }
}

async function analisarCardapio(imagemBase64) {
    console.log("Enviando imagem para IA...");
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: `Leia este cardápio e extraia os produtos. Retorne SOMENTE JSON neste formato: [{ "nome": "Nome do produto", "preco": 0 }]` },
                    { type: "image_url", image_url: { url: imagemBase64 } }
                ]
            }
        ]
    });
    const texto = response.choices[0].message.content;
    try {
        const jsonLimpo = texto.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonLimpo);
    } catch {
        console.log("IA retornou texto inválido:", texto);
        return [];
    }
}

async function gerarDistribuicaoLucro(dados) {
    const faturamento = Number(dados.faturamentoMensal) || 0;
    const custos = Number(dados.custosTotais) || 0;
    const lucro = faturamento - custos;

    if (lucro <= 0) return { retirada: 0, reinvestimento: 0, reserva: 0 };

    const margem = lucro / faturamento;
    let retirada, reinvestimento, reserva;

    if (margem < 0.15) {
        retirada = lucro * 0.2;
        reinvestimento = lucro * 0.3;
        reserva = lucro * 0.5;
    } else if (margem < 0.35) {
        retirada = lucro * 0.4;
        reinvestimento = lucro * 0.35;
        reserva = lucro * 0.25;
    } else {
        retirada = lucro * 0.5;
        reinvestimento = lucro * 0.35;
        reserva = lucro * 0.15;
    }

    return { retirada, reinvestimento, reserva };
}

// === Export único de todas as funções ===
module.exports = {
    gerarPromptDiagnostico,
    solicitarAnaliseIA,
    analisarCardapio,
    gerarDistribuicaoLucro
};