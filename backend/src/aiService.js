const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

module.exports = { solicitarAnaliseIA };