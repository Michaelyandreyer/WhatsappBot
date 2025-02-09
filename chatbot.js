const fs = require('fs-extra');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// 🔹 Inicializa o cliente do WhatsApp Web.js com sessão salva
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Altere para false se quiser ver o navegador do WhatsApp Web
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

// 🔹 Captura mensagens recebidas e exibe no terminal para debug
client.on('message', async msg => {
    console.log(`📩 Mensagem recebida de ${msg.from}: "${msg.body}"`);

    const texto = msg.body.toLowerCase().trim(); // Normaliza a mensagem

    // 🔹 Exibe o menu interativo quando o usuário manda "Oi" ou "Menu"
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

    // 🔹 Integração para reservar hotel
    if (texto === '1') {
        await client.sendMessage(msg.from, 
            '🏨 Para reservar um hotel, por favor informe:\n\n' +
            '➡ Seu nome completo\n' +
            '➡ Data de entrada (ex: 15/02/2025)\n' +
            '➡ Data de saída (ex: 20/02/2025)\n' +
            '➡ Tipo de quarto (simples, casal, luxo)\n\n' +
            'Se quiser voltar ao menu principal, digite "voltar".'
        );
        return;
    }

    // 🔹 Integração para se tornar sócio
    if (texto === '2') {
        await client.sendMessage(msg.from, 
            '👥 Para se tornar sócio, escolha um dos planos:\n\n' +
            '🔹 *Plano Básico*: R$ 50/mês\n' +
            '🔹 *Plano Premium*: R$ 100/mês\n' +
            '🔹 *Plano VIP*: R$ 200/mês\n\n' +
            'Digite "1" ou "quero me associar" para iniciar seu cadastro.\n\n' +
            'Se quiser voltar ao menu principal, digite "voltar".'
        );
        return;
    }

    if (texto.includes("quero me associar")) {
        const numeroDestino = "5511999999999"; // Substitua pelo número desejado (com DDI e DDD)
        const linkWhatsApp = `https://wa.me/${numeroDestino}?text=Olá!%20Gostaria%20de%20me%20associar.`;
    
        await client.sendMessage(msg.from,
            `✅ Para concluir sua associação, clique no link abaixo para falar com um atendente:\n\n` +
            `👉 ${linkWhatsApp} \n\n` +
            `Se quiser voltar ao menu principal, digite "voltar".`
        );
        return;
    }

    // 🔹 Integração para cancelamento de plano
    if (texto === '3') {
        await client.sendMessage(msg.from, 
            '❌ Para cancelar seu plano, informe seu número de contrato ou CPF.\n' +
            'Um atendente entrará em contato para finalizar o cancelamento.\n\n' +
            'Se quiser voltar ao menu principal, digite "voltar".'
        );
        return;
    }

    // 🔹 Integração para falar com um advogado
    if (texto === '4') {
        await client.sendMessage(msg.from, 
            '⚖️ Para falar com um advogado, por favor envie as seguintes informações:\n\n' +
            '1️⃣ Seu *Nome Completo*\n' +
            '2️⃣ Seu *CPF*\n' +
            '3️⃣ Sua *Inscrição* (se aplicável)\n' +
            '4️⃣ Uma *descrição breve* do problema\n\n' +
            'Após enviar essas informações, você receberá um link para falar com um advogado.\n\n' +
            'Se quiser voltar ao menu principal, digite "voltar".'
        );
        return;
    }

    // 🔹 Após receber as informações, envia o link do advogado
    if (texto.includes("advogado") || texto.includes("problema") || texto.includes("cpf")) {
        const numeroAdvogado = "5511988887777"; // Substitua pelo número do advogado
        const linkAdvogado = `https://wa.me/${numeroAdvogado}?text=Olá!%20Preciso%20de%20orientação%20jurídica.`;
        
        await client.sendMessage(msg.from,
            `✅ Obrigado por enviar suas informações!\n\n` +
            `Para falar diretamente com um advogado, clique no link abaixo:\n\n` +
            `👉 ${linkAdvogado} \n\n` +
            `Se quiser voltar ao menu principal, digite "voltar".`
        );
        return;
    }

    // 🔹 Opção de voltar para o menu principal
    if (texto === '5' || texto.includes('voltar')) {
        await client.sendMessage(msg.from, 
            '🔄 Você voltou ao menu principal!\n\n' +
            '1️⃣ - Reservar um Hotel 🏨\n' +
            '2️⃣ - Tornar-se Sócio 👥\n' +
            '3️⃣ - Cancelamento de Plano ❌\n' +
            '4️⃣ - Falar com Advogado ⚖️\n' +
            '5️⃣ - Voltar 🔄\n\n' +
            'Digite o número correspondente para escolher.'
        );
        return;
    }

    // 🔹 Se a mensagem não for um comando válido, ignora e não responde
    if (!['1', '2', '3', '4', '5', 'quero me associar'].includes(texto)) {
        console.log(`🔕 Mensagem ignorada: "${msg.body}"`); // Apenas registra no terminal
        return;
    }

    // 🔹 Se a mensagem não for reconhecida, responde com instruções
    await msg.reply('❌ Desculpe, não entendi. Digite "Menu" ou "Oi" para ver as opções disponíveis.');
});

// 🔹 Inicia o bot
client.initialize();
