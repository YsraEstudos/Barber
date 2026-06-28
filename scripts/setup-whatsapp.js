/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// Load local environment variables manually (dependency-free)
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    process.env[key] = value;
  });
}

loadEnvLocal();

const apiUrl = process.env.EVOLUTION_API_URL || "http://localhost:8080";
const apiKey = process.env.EVOLUTION_API_KEY || "change-me-local";
const instanceName = process.env.EVOLUTION_INSTANCE_NAME || "aureum_barber";

async function setupWhatsApp() {
  console.log("=========================================");
  console.log("⚙️  Configurando Instância no Evolution API...");
  console.log(`URL da API: ${apiUrl}`);
  console.log(`Instância: ${instanceName}`);
  console.log("=========================================\n");

  const cleanUrl = apiUrl.replace(/\/$/, "");

  // 1. Verificar se a API está online
  try {
    const statusResponse = await fetch(`${cleanUrl}/instance/fetchInstances`, {
      headers: { apikey: apiKey },
    });
    if (!statusResponse.ok) {
      throw new Error(`Status ${statusResponse.status}`);
    }
  } catch {
    console.error("❌ A Evolution API não está acessível no endereço informado.");
    console.error("Por favor, verifique se o Docker está rodando e execute:");
    console.error("👉 docker compose up -d\n");
    process.exit(1);
  }

  // 2. Tentar buscar se a instância já existe
  try {
    const checkResponse = await fetch(`${cleanUrl}/instance/connectionState/${instanceName}`, {
      headers: { apikey: apiKey },
    });
    
    if (checkResponse.ok) {
      const state = await checkResponse.json();
      console.log(`ℹ️ Instância "${instanceName}" já existe.`);
      console.log(`Estado atual da conexão: *${state.instance?.state ?? "desconhecido"}*`);
      
      if (state.instance?.state === "open") {
        console.log("✅ Dispositivo já conectado e pronto para uso!");
        return;
      }
      
      console.log("\n👇 Para conectar seu WhatsApp, acesse a URL abaixo no navegador para escanear o QR Code:");
      console.log(`🔗 http://localhost:8083/`);
      return;
    }
  } catch {
    // Continua para criação caso não exista
  }

  // 3. Criar a instância
  console.log(`Criando a instância "${instanceName}"...`);
  try {
    const createResponse = await fetch(`${cleanUrl}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        instanceName: instanceName,
        token: "",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      }),
    });

    const data = await createResponse.json();

    if (!createResponse.ok) {
      console.error("❌ Falha ao criar a instância:", data.message || data);
      process.exit(1);
    }

    console.log("✅ Instância criada com sucesso!");
    console.log("\n👇 Para escanear o QR Code e conectar seu celular:");
    console.log("1. Abra a Manager UI da Evolution API no navegador:");
    console.log("   👉 http://localhost:8083/");
    console.log(`2. Faça login com a API Key definida no seu .env.local: "${apiKey}"`);
    console.log(`3. Selecione a instância "${instanceName}" e escaneie o QR Code.`);
    console.log("\n=========================================");
  } catch (error) {
    console.error("❌ Erro ao enviar requisição de criação:", error);
  }
}

setupWhatsApp();
