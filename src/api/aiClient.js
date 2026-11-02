/**
 * OPUS AI Financial Intelligence Service
 * Powered by Alibaba Cloud Model Studio (Qwen / DashScope OpenAI-compatible API)
 */

import { sendWhatsAppMessage } from "@/api/evolutionWhatsApp";

const AI_STORAGE_KEY = "opus_ai_config";

export const DEFAULT_AI_CONFIG = {
  apiKey: "sk-ws-H.DILHHXY.d4Is.MEUCIQCLk4Rh37sgpqvOZhSCbQxkssPpQKsLowwZylNB36KRRQIgA0E9-hSBFemEKGDX6jovEWGKhc9nU7TdkFNGa_g0Wes",
  baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  model: "qwen-plus",
  autoRecordTransactions: true,
  autoSendWhatsAppReceipt: false,
  recipientPhone: "",
};

export function getAIConfig() {
  if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAIConfig(updates) {
  if (typeof window === "undefined") return;
  const current = getAIConfig();
  const next = { ...current, ...updates };
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("opus_ai_config_changed", { detail: next }));
  return next;
}

/**
 * Verify AI connection
 */
export async function testAIConnection() {
  const cfg = getAIConfig();
  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: "user", content: "Ping" }],
        max_tokens: 10,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Send chat message to Qwen AI, parse financial actions, record into app, and dispatch WhatsApp alert
 */
export async function generateAIFinancialReply({ messages, financialContext = {}, db }) {
  const cfg = getAIConfig();

  const balance = financialContext.totalBalance ?? "N/A";
  const monthlyIncome = financialContext.monthlyIncome ?? "N/A";
  const monthlyExpenses = financialContext.monthlyExpenses ?? "N/A";
  const categories = financialContext.categories || [
    "Housing", "Transportation", "Food & Dining", "Utilities",
    "Healthcare", "Entertainment", "Shopping", "Income", "Other"
  ];

  const systemPrompt = `You are OPUS AI, the expert personal and family financial copilot for OPUS by octtapus.
Current User Financial Snapshot:
- Net Balance: $${balance}
- Monthly Income: $${monthlyIncome}
- Monthly Expenses: $${monthlyExpenses}
- Standard Categories: ${categories.join(", ")}

Capabilities:
1. Provide concise, clear, and actionable financial guidance.
2. If the user mentions spending money, paying a bill, or receiving money (e.g. "spent $40 on lunch", "paid $120 electricity bill", "received $2500 salary"), YOU MUST automatically formulate a transaction record by adding this exact block at the bottom of your answer:

ACTION_RECORD_TRANSACTION:
{
  "type": "expense" | "income",
  "amount": <number without currency symbol>,
  "category": "<one of the standard categories>",
  "description": "<concise description>",
  "payment_method": "Credit Card" | "Debit Card" | "Cash" | "Bank Transfer"
}

Tone:
- Professional, warm, encouraging, concise.
- Never show raw technical IDs or errors.
- If a transaction is created, confirm the amount and category in human terms.`;

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content || "",
    })),
  ];

  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: apiMessages,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `AI gateway error (${res.status})`);
    }

    const data = await res.json();
    const rawReply = data.choices?.[0]?.message?.content || "I couldn't process that right now.";

    let cleanReply = rawReply;
    let recordedTransaction = null;
    const toolCalls = [];

    // Check for transaction action
    const actionMatch = rawReply.match(/ACTION_RECORD_TRANSACTION:\s*(\{[\s\S]*?\})/);
    if (actionMatch && actionMatch[1]) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        cleanReply = rawReply.replace(/ACTION_RECORD_TRANSACTION:\s*\{[\s\S]*?\}/, "").trim();

        if (cfg.autoRecordTransactions && db?.entities?.Transaction?.create) {
          const now = new Date();
          const newTx = await db.entities.Transaction.create({
            type: actionData.type || "expense",
            amount: Number(actionData.amount) || 0,
            category: actionData.category || "Other",
            description: actionData.description || "Expense",
            payment_method: actionData.payment_method || "Credit Card",
            date: now.toISOString().split("T")[0],
            time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
          recordedTransaction = newTx;

          toolCalls.push({
            name: "record_transaction_in_app",
            status: "success",
            arguments_string: JSON.stringify(actionData),
            results: {
              success: true,
              message: `Recorded ${actionData.type === "income" ? "+" : "-"}$${Number(actionData.amount).toFixed(2)} in ${actionData.category}`,
              id: newTx.id,
            },
          });

          // Optional Auto WhatsApp Dispatch
          const targetPhone = cfg.recipientPhone;
          if (cfg.autoSendWhatsAppReceipt && targetPhone) {
            try {
              await sendWhatsAppMessage({
                number: targetPhone,
                text: `💳 *TRANSACTION RECORDED IN OPUS*\n\n• *${actionData.description}*\n• *Amount:* ${actionData.type === "income" ? "+" : "-"}$${Number(actionData.amount).toFixed(2)}\n• *Category:* ${actionData.category}\n• *Method:* ${actionData.payment_method || "Card"}\n\n_Auto-recorded by OPUS AI Assistant_`,
              });
              toolCalls.push({
                name: "send_whatsapp_receipt",
                status: "success",
                results: { success: true, phone: targetPhone },
              });
            } catch (wErr) {
              console.warn("WhatsApp receipt auto-send failed:", wErr);
            }
          }
        }
      } catch (parseErr) {
        console.warn("Failed to parse action json:", parseErr);
      }
    }

    return {
      content: cleanReply,
      tool_calls: toolCalls,
      recordedTransaction,
    };
  } catch (err) {
    console.error("AI Generation Error:", err);
    throw err;
  }
}
