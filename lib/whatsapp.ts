export const ADDRESS = "Rua José Bezerra Sobrinho, s/n, em frente à prefeitura de Tamandaré – PE";
export const MAPS_URL = "https://maps.google.com/?q=Rua+Jos%C3%A9+Bezerra+Sobrinho,+Tamandar%C3%A9,+PE";
export const WHATSAPP_DISPLAY = "(81) 99681-9959";
export const RESERVA_TIPOS = ["Mesa", "Área da piscina", "Aniversário / evento privado"] as const;

export function whatsappLink(message: string) {
  return `https://wa.me/5581996819959?text=${encodeURIComponent(message)}`;
}

export function buildReservaMessage(form: { nome: string; whatsapp: string; data: string; pessoas: string; tipo: string; observacoes: string }) {
  return [
    "Olá! Gostaria de fazer uma reserva no Tamandaré Club.",
    `Nome: ${form.nome}`,
    `WhatsApp: ${form.whatsapp}`,
    `Data: ${form.data}`,
    `Número de pessoas: ${form.pessoas}`,
    `Tipo de reserva: ${form.tipo}`,
    form.observacoes ? `Observações: ${form.observacoes}` : "",
  ].filter(Boolean).join("\n");
}

