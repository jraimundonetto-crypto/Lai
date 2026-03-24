/**
 * TESTE DE INTEGRIDADE - LUCRA AI
 */

const { processarDiagnostico } = require('./controller');

// ID copiado diretamente da sua imagem
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000'; 

async function rodarTeste() {
    console.log("🚀 Iniciando Teste de Integridade do LUCRA AI...");
    
    const resultado = await processarDiagnostico(TEST_USER_ID);
    
    if (resultado.status === "SUCESSO") {
        console.log("\n✅ DIAGNÓSTICO ESTRATÉGICO GERADO:");
        console.log("---------------------------------------");
        console.log(resultado.diagnostico);
    } else {
        console.error("\n❌ ERRO NO TESTE:");
        console.error("Motivo:", resultado.mensagem);
    }
}

rodarTeste();