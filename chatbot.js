const fs = require('fs-extra');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');

// 🔹 Chave da API da DeepSeek
const DEEPSEEK_API_KEY = "sk-97dcebcf9f624b9bb727e4b2b969631d";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat"; // Verifique a URL oficial da API

// 🔹 Inicializa o cliente do WhatsApp Web.js
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

// 🔹 Gera o QR Code no terminal para autenticação
client.on('qr', qr => {
    console.log('📸 Escaneie o QR Code para conectar seu WhatsApp.');
    qrcode.generate(qr, { small: true });
});

// 🔹 Confirmação de conexão
client.on('ready', () => {
    console.log('✅ Chatbot conectado ao WhatsApp!');
});

// 🔹 Função para integrar com a DeepSeek AI
async function getDeepSeekResponse(userMessage) {
    try {
        const response = await axios.post(DEEPSEEK_API_URL, {
            model: "deepseek-chat",
            messages: [{ role: "user", content: userMessage }]
        }, {
            headers: {
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ Erro ao chamar a API DeepSeek:", error.message);
        return "❌ Houve um erro ao processar sua solicitação. Tente novamente mais tarde.";
    }
}

// 🔹 Captura mensagens recebidas e exibe no terminal para debug
client.on('message', async msg => {
    console.log(`📩 Mensagem recebida de ${msg.from}: "${msg.body}"`);

    const texto = msg.body.toLowerCase().trim();

    // 🔹 Exibe o menu principal
    if (texto === 'oi' || texto === 'menu') {
        await client.sendMessage(msg.from,
            '🤖 Olá! Como posso te ajudar?\n\n' +
            '1️⃣ - Reservar um Hotel de Trânsito 🏨\n' +
            '2️⃣ - Tornar-se Sócio 👥\n' +
            '3️⃣ - Cancelamento de Plano ❌\n' +
            '4️⃣ - Falar com Advogado ⚖️\n' +
            '5️⃣ - Voltar 🔄\n\n' +
            'Digite o número correspondente para escolher.'
        );
        return;
    }

    // 🔹 Opção 1: Reservar hotel
    if (texto === '1') {
        await client.sendMessage(msg.from,
            '🏨 Para reservar um hotel, informe:\n\n' +
            '➡ Nome completo\n' +
            '➡ Data de entrada e saída (ex: 15/02/2025 - 20/02/2025)\n' +
            '➡ Tipo de quarto (simples, casal, luxo)\n\n' +
            'Se quiser voltar ao menu principal, digite "voltar".'
        );
        return;
    }

    // 🔹 Opção 2: Tornar-se sócio
    if (texto === '2') {
        await client.sendMessage(msg.from,
            '👥 Planos de associação:\n\n' +
            '🔹 *Básico*: R$ 50/mês\n' +
            '🔹 *Premium*: R$ 100/mês\n' +
            '🔹 *VIP*: R$ 200/mês\n\n' +
            'Digite "1" ou "quero me associar" para iniciar o cadastro.\n\n' +
            'Se quiser voltar ao menu principal, digite "voltar".'
        );
        return;
    }

    // 🔹 Enviar para atendente via WhatsApp
    if (texto.includes("quero me associar")) {
        const numeroAtendente = "5511999999999"; // Substitua pelo número correto
        const linkWhatsApp = `https://wa.me/${numeroAtendente}?text=Olá!%20Gostaria%20de%20me%20associar.`;
    
        await client.sendMessage(msg.from,
            `✅ Clique no link abaixo para falar com um atendente:\n\n` +
            `👉 ${linkWhatsApp} \n\n` +
            `Se quiser voltar ao menu principal, digite "voltar".`
        );
        return;
    }

    // 🔹 Opção 3: Cancelamento de plano
    if (texto === '3') {
        await client.sendMessage(msg.from,
            '❌ Para cancelar seu plano, envie seu CPF ou número do contrato.\n\n' +
            'Se quiser voltar ao menu principal, digite "voltar".'
        );
        return;
    }

    // 🔹 Opção 4: Falar com advogado
    if (texto === '4') {
        await client.sendMessage(msg.from,
            '⚖️ Para falar com um advogado, envie:\n\n' +
            '1️⃣ Nome completo\n' +
            '2️⃣ CPF\n' +
            '3️⃣ Inscrição (se aplicável)\n' +
            '4️⃣ Breve descrição do problema\n\n' +
            'Após o envio, você receberá um link para falar com um advogado.\n\n' +
            'Se quiser voltar ao menu principal, digite "voltar".'
        );
        return;
    }

    // 🔹 Enviar para advogado
    if (texto.includes("advogado") || texto.includes("problema") || texto.includes("cpf")) {
        const numeroAdvogado = "5511988887777"; // Substitua pelo número do advogado
        const linkAdvogado = `https://wa.me/${numeroAdvogado}?text=Olá!%20Preciso%20de%20orientação%20jurídica.`;

        await client.sendMessage(msg.from,
            `✅ Obrigado! Para falar com um advogado, clique no link abaixo:\n\n` +
            `👉 ${linkAdvogado} \n\n` +
            `Se quiser voltar ao menu principal, digite "voltar".`
        );
        return;
    }

    // 🔹 Opção 5: Voltar ao menu principal
    if (texto === '5' || texto.includes('voltar')) {
        await client.sendMessage(msg.from, '🔄 Você voltou ao menu principal! Digite "Menu" para ver as opções.');
        return;
    }

    // 🔹 Se não reconhecer o comando, chama a IA da DeepSeek
    const deepSeekResponse = await getDeepSeekResponse(texto);
    await client.sendMessage(msg.from, deepSeekResponse);
});

// 🔹 Inicia o bot
client.initialize();
