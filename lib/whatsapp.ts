const evolutionApiUrl = process.env.EVOLUTION_API_URL;
const evolutionApiKey = process.env.EVOLUTION_API_KEY;
const evolutionInstanceName = process.env.EVOLUTION_INSTANCE_NAME;

export const isWhatsAppConfigured = Boolean(
  evolutionApiUrl && evolutionApiKey && evolutionInstanceName
);

/**
 * Envia uma mensagem de texto usando a Evolution API do WhatsApp.
 * @param to Número do telefone do destinatário (apenas dígitos, contendo código do país e DDD).
 * @param text Mensagem de texto que será enviada.
 */
export async function sendWhatsAppMessage(to: string, text: string) {
  if (!isWhatsAppConfigured || !evolutionApiUrl || !evolutionApiKey || !evolutionInstanceName) {
    console.warn("WhatsApp não integrado: preencha as variáveis da Evolution API no .env");
    return { success: false, reason: "Evolution API not configured" };
  }

  // A Evolution API espera o formato com código do país (ex: +55 ou 55 para o Brasil).
  // Adiciona '55' caso falte (caso o número comece apenas com o DDD).
  let cleanNumber = to.replace(/\D/g, "");
  if (cleanNumber.length <= 11 && !cleanNumber.startsWith("55")) {
    cleanNumber = "55" + cleanNumber;
  }

  const url = `${evolutionApiUrl.replace(/\/$/, "")}/message/sendText/${evolutionInstanceName}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: evolutionApiKey,
      },
      body: JSON.stringify({
        number: cleanNumber,
        options: {
          delay: 1200,
          presence: "composing",
          linkPreview: false,
        },
        textMessage: {
          text: text,
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`Erro ao enviar mensagem via Evolution API (${response.status}): ${detail}`);
      return { success: false, reason: `Evolution API returned ${response.status}`, detail };
    }

    const data = await response.json();
    console.log(`Mensagem de WhatsApp enviada com sucesso para ${cleanNumber}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao conectar à Evolution API:", error);
    return { success: false, error };
  }
}
