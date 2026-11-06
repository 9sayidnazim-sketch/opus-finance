/**
 * OPUS AI Financial Intelligence Engine
 * Multi-Provider Architecture supporting:
 * 1. Alibaba Cloud Model Studio (Qwen-Plus, Qwen-Turbo, Qwen-Max)
 * 2. Z-AI GLM on NVIDIA NIM (z-ai/glm-5.3-flash, z-ai/glm-5.2)
 * 3. DeepSeek on NVIDIA NIM / Direct (deepseek-ai/deepseek-v4.1-flash, deepseek-chat)
 * 4. Custom OpenAI-compatible endpoints
 * 
 * Features:
 * - Separate (Per-Workspace) vs Single (Unified) AI Memory
 * - Separate vs Single Database Awareness
 * - Automatic Natural Language Transaction Extraction & Ledger Logging
 * - WhatsApp Receipt Dispatch
 */

import { sendWhatsAppMessage } from "@/api/evolutionWhatsApp";

const AI_STORAGE_KEY = "opus_ai_config_v2";
const AI_MEMORY_SCOPE_KEY = "opus_ai_memory_scope"; // 'separate' | 'single'
const DATABASE_MODE_KEY = "opus_database_mode"; // 'separate' | 'single'

export const PROVIDERS_CATALOG = {
  qwen: {
    id: "qwen",
    name: "Alibaba DashScope (Qwen)",
    badge: "Qwen",
    defaultBaseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    defaultApiKey: "sk-ws-H.DILHHXY.d4Is.MEUCIQCLk4Rh37sgpqvOZhSCbQxkssPpQKsLowwZylNB36KRRQIgA0E9-hSBFemEKGDX6jovEWGKhc9nU7TdkFNGa_g0Wes",
    models: ["qwen-plus", "qwen-turbo", "qwen-max"],
    defaultModel: "qwen-plus",
    description: "High-accuracy multilingual reasoning and financial entity extraction"
  },
  glm: {
    id: "glm",
    name: "Z-AI GLM (NVIDIA NIM)",
    badge: "GLM-5",
    defaultBaseUrl: "https://integrate.api.nvidia.com/v1",
    defaultApiKey: "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",
    models: ["z-ai/glm-5.3-flash", "z-ai/glm-5.2"],
    defaultModel: "z-ai/glm-5.3-flash",
    description: "High-speed reasoning model running on NVIDIA NIM with GLM 5.3 Flash & 5.2"
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek (NVIDIA NIM)",
    badge: "DeepSeek",
    defaultBaseUrl: "https://integrate.api.nvidia.com/v1",
    defaultApiKey: "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",
    models: ["deepseek-ai/deepseek-v4.1-flash", "deepseek-chat"],
    defaultModel: "deepseek-ai/deepseek-v4.1-flash",
    description: "DeepSeek reasoning model on NVIDIA NIM infrastructure"
  },
  custom: {
    id: "custom",
    name: "Custom OpenAI-Compatible",
    badge: "Custom",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultApiKey: "",
    models: ["gpt-4o-mini", "gpt-4o", "claude-3-5-sonnet"],
    defaultModel: "gpt-4o-mini",
    description: "Connect your own private proxy or cloud LLM provider"
  }
};

export const DEFAULT_AI_CONFIG = {
  activeProvider: "glm", // Default to GLM 5.3 (verified live on NVIDIA NIM) or Qwen
  providerConfigs: {
    qwen: {
      apiKey: PROVIDERS_CATALOG.qwen.defaultApiKey,
      baseUrl: PROVIDERS_CATALOG.qwen.defaultBaseUrl,
      model: PROVIDERS_CATALOG.qwen.defaultModel,
    },
    glm: {
      apiKey: PROVIDERS_CATALOG.glm.defaultApiKey,
      baseUrl: PROVIDERS_CATALOG.glm.defaultBaseUrl,
      model: PROVIDERS_CATALOG.glm.defaultModel,
    },
    deepseek: {
      apiKey: PROVIDERS_CATALOG.deepseek.defaultApiKey,
      baseUrl: PROVIDERS_CATALOG.deepseek.defaultBaseUrl,
      model: PROVIDERS_CATALOG.deepseek.defaultModel,
    },
    custom: {
      apiKey: "",
      baseUrl: PROVIDERS_CATALOG.custom.defaultBaseUrl,
      model: PROVIDERS_CATALOG.custom.defaultModel,
    }
  },
  autoRecordTransactions: true,
  autoSendWhatsAppReceipt: false,
  recipientPhone: "",
};

// --- Config Management ---
export function getAIConfig() {
  if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(DEFAULT_AI_CONFIG));
      return DEFAULT_AI_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_AI_CONFIG,
      ...parsed,
      providerConfigs: {
        ...DEFAULT_AI_CONFIG.providerConfigs,
        ...(parsed.providerConfigs || {}),
        qwen: { ...DEFAULT_AI_CONFIG.providerConfigs.qwen, ...(parsed.providerConfigs?.qwen || {}) },
        glm: { ...DEFAULT_AI_CONFIG.providerConfigs.glm, ...(parsed.providerConfigs?.glm || {}) },
        deepseek: { ...DEFAULT_AI_CONFIG.providerConfigs.deepseek, ...(parsed.providerConfigs?.deepseek || {}) },
        custom: { ...DEFAULT_AI_CONFIG.providerConfigs.custom, ...(parsed.providerConfigs?.custom || {}) },
      }
    };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAIConfig(updates) {
  if (typeof window === "undefined") return;
  const current = getAIConfig();
  const next = {
    ...current,
    ...updates,
    providerConfigs: {
      ...current.providerConfigs,
      ...(updates.providerConfigs || {}),
    }
  };
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("opus_ai_config_changed", { detail: next }));
  return next;
}

export function getActiveProviderDetails() {
  const cfg = getAIConfig();
  const providerKey = cfg.activeProvider || "glm";
  const pMeta = PROVIDERS_CATALOG[providerKey] || PROVIDERS_CATALOG.glm;
  const pCfg = cfg.providerConfigs?.[providerKey] || pMeta;
  return {
    providerKey,
    name: pMeta.name,
    badge: pMeta.badge,
    apiKey: pCfg.apiKey || pMeta.defaultApiKey,
    baseUrl: pCfg.baseUrl || pMeta.defaultBaseUrl,
    model: pCfg.model || pMeta.defaultModel,
    models: pMeta.models,
  };
}

// --- AI Memory Architecture (Separate vs Single) ---
export function getAIMemoryScope() {
  if (typeof window === "undefined") return "separate";
  return localStorage.getItem(AI_MEMORY_SCOPE_KEY) || "separate";
}

export function setAIMemoryScope(scope) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AI_MEMORY_SCOPE_KEY, scope);
  window.dispatchEvent(new CustomEvent("opus_memory_scope_changed", { detail: scope }));
}

function getMemoryStorageKey() {
  const scope = getAIMemoryScope();
  if (scope === "single") {
    return "opus_ai_memory_single";
  }
  const activeTenant = (typeof window !== "undefined" && localStorage.getItem("opus_active_tenant_id")) || "tenant_personal";
  return `opus_ai_memory_${activeTenant}`;
}

export function getAIMemory() {
  if (typeof window === "undefined") return { facts: [], habits: [], profile: {} };
  const key = getMemoryStorageKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const defaults = {
        facts: [
          "Primary currency is USD ($)",
          "Rent and utilities are tracked as high-priority bills",
          "Preferred payment method: Credit Card"
        ],
        habits: [
          "Regular grocery shopping happens weekly",
          "Coffee and quick meals categorized under Food & Dining"
        ],
        profile: {
          savingsTargetPercentage: 20,
          budgetWarningThreshold: 80
        }
      };
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return { facts: [], habits: [], profile: {} };
  }
}

export function saveAIMemory(memory) {
  if (typeof window === "undefined") return;
  const key = getMemoryStorageKey();
  localStorage.setItem(key, JSON.stringify(memory));
  window.dispatchEvent(new CustomEvent("opus_ai_memory_updated", { detail: memory }));
}

export function addAIMemoryFact(factText) {
  if (!factText?.trim()) return;
  const mem = getAIMemory();
  const updated = {
    ...mem,
    facts: [factText.trim(), ...mem.facts.filter(f => f !== factText.trim())]
  };
  saveAIMemory(updated);
  return updated;
}

export function deleteAIMemoryFact(index) {
  const mem = getAIMemory();
  const updated = {
    ...mem,
    facts: mem.facts.filter((_, i) => i !== index)
  };
  saveAIMemory(updated);
  return updated;
}

export function clearAIMemory() {
  const empty = { facts: [], habits: [], profile: {} };
  saveAIMemory(empty);
  return empty;
}

// --- Database Mode Architecture (Separate vs Single) ---
export function getDatabaseMode() {
  if (typeof window === "undefined") return "separate";
  return localStorage.getItem(DATABASE_MODE_KEY) || "separate";
}

export function setDatabaseMode(mode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DATABASE_MODE_KEY, mode);
  window.dispatchEvent(new CustomEvent("opus_database_mode_changed", { detail: mode }));
}

// --- AI Proxy & Resilient Gateway Execution ---
export async function executeAICompletion({ baseUrl, apiKey, model, messages, temperature = 0.7, max_tokens }) {
  const candidateModels = [model];
  if (model === "z-ai/glm-5.2") candidateModels.push("z-ai/glm-5.3-flash");
  if (model === "deepseek-ai/deepseek-v4.1-flash") candidateModels.push("deepseek-ai/deepseek-r1", "deepseek-ai/deepseek-v3");

  let lastError = null;

  for (const currentModel of candidateModels) {
    // 1. First attempt: call /api/ai proxy (eliminates browser CORS restrictions)
    try {
      const proxyRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl,
          apiKey,
          model: currentModel,
          messages,
          temperature,
          ...(max_tokens ? { max_tokens } : {}),
        }),
        signal: AbortSignal.timeout(35000),
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return { data, usedModel: currentModel };
      }

      const errJson = await proxyRes.json().catch(() => ({}));
      const errMsg = errJson.error || errJson.detail || `Proxy HTTP ${proxyRes.status}`;

      if (proxyRes.status === 404 || errMsg.toLowerCase().includes("not found") || errMsg.toLowerCase().includes("decommissioned")) {
        lastError = new Error(errMsg);
        continue;
      }

      // If proxy route itself is missing (404 without JSON error), break to direct fetch
      if (proxyRes.status === 404 && !errJson.error) {
        throw new Error("Proxy route not available");
      }

      throw new Error(errMsg);
    } catch (proxyErr) {
      // 2. Direct fetch fallback (for local custom setups or CORS-friendly proxies)
      try {
        const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
        const directRes = await fetch(`${cleanBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: currentModel,
            messages,
            temperature,
            ...(max_tokens ? { max_tokens } : {}),
          }),
          signal: AbortSignal.timeout(25000),
        });

        if (directRes.ok) {
          const data = await directRes.json();
          return { data, usedModel: currentModel };
        }

        const errJson = await directRes.json().catch(() => ({}));
        const errMsg = errJson.detail || errJson.message || `AI API HTTP ${directRes.status}`;

        if (directRes.status === 404 || errMsg.toLowerCase().includes("not found")) {
          lastError = new Error(errMsg);
          continue;
        }

        throw new Error(errMsg);
      } catch (directErr) {
        lastError = directErr;
      }
    }
  }

  throw lastError || new Error("Failed to communicate with AI gateway");
}

// --- Test AI Connection for Any Provider ---
export async function testAIConnection(providerKey) {
  const cfg = getAIConfig();
  const targetKey = providerKey || cfg.activeProvider || "glm";
  const pMeta = PROVIDERS_CATALOG[targetKey] || PROVIDERS_CATALOG.glm;
  const pCfg = cfg.providerConfigs?.[targetKey] || {};

  const apiKey = pCfg.apiKey || pMeta.defaultApiKey;
  const baseUrl = pCfg.baseUrl || pMeta.defaultBaseUrl;
  const model = pCfg.model || pMeta.defaultModel;

  const start = performance.now();
  try {
    const { data, usedModel } = await executeAICompletion({
      baseUrl,
      apiKey,
      model,
      messages: [{ role: "user", content: "Ping" }],
      max_tokens: 15,
      temperature: 0.1,
    });

    const latencyMs = Math.round(performance.now() - start);
    return { 
      ok: true, 
      status: 200, 
      latencyMs, 
      model: usedModel || model, 
      provider: pMeta.name,
      sampleResponse: data.choices?.[0]?.message?.content || "Connected"
    };
  } catch (err) {
    return { ok: false, error: err.message, model, provider: pMeta.name };
  }
}

/**
 * Generate AI Financial Guidance, parse natural language actions, record in ledger,
 * and dispatch WhatsApp alerts with full memory & database mode context.
 */
export async function generateAIFinancialReply({ messages, financialContext = {}, db }) {
  const cfg = getAIConfig();
  const activeDetails = getActiveProviderDetails();
  const memoryScope = getAIMemoryScope();
  const dbMode = getDatabaseMode();
  const memory = getAIMemory();

  const balance = financialContext.totalBalance ?? "N/A";
  const monthlyIncome = financialContext.monthlyIncome ?? "N/A";
  const monthlyExpenses = financialContext.monthlyExpenses ?? "N/A";
  const categories = financialContext.categories || [
    "Housing", "Transportation", "Food & Dining", "Utilities",
    "Healthcare", "Entertainment", "Shopping", "Income", "Other"
  ];

  // System prompt infused with Memory & Database configuration
  const memoryFactsText = memory.facts && memory.facts.length > 0 
    ? memory.facts.map(f => `  • ${f}`).join("\n") 
    : "  • No custom financial rules recorded yet.";

  const systemPrompt = `You are OPUS AI, the expert personal, family, and multi-tenant financial intelligence copilot for OPUS by octtapus.
Current Engine: ${activeDetails.name} (${activeDetails.model})
Active Database Mode: ${dbMode.toUpperCase()} (${dbMode === 'single' ? 'Single Unified Ledger' : 'Separate Workspace Isolated'})
AI Memory Architecture: ${memoryScope.toUpperCase()} (${memoryScope === 'single' ? 'Single Global Memory across all workspaces' : 'Separate Workspace-Specific Memory'})

Current Financial Snapshot:
- Net Balance: $${balance}
- Monthly Income: $${monthlyIncome}
- Monthly Expenses: $${monthlyExpenses}
- Standard Categories: ${categories.join(", ")}

Learned Financial Memory & User Preferences:
${memoryFactsText}

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

3. If the user asks you to remember a financial rule, preference, or fact (e.g. "remember that rent is $1500", "my primary card is Visa"), add this exact block:

ACTION_LEARN_FACT:
{
  "fact": "<clear concise fact to persist in memory>"
}

Tone & Rules:
- Professional, warm, encouraging, concise.
- Never expose internal technical identifiers or system keys.
- Confirm any recorded transaction clearly with its amount and category.`;

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content || "",
    })),
  ];

  try {
    const { data, usedModel } = await executeAICompletion({
      baseUrl: activeDetails.baseUrl,
      apiKey: activeDetails.apiKey,
      model: activeDetails.model,
      messages: apiMessages,
      temperature: 0.7,
    });

    const messageObj = data.choices?.[0]?.message;
    const rawReply = messageObj?.content || messageObj?.reasoning_content || "I couldn't process that right now.";

    let cleanReply = rawReply;
    let recordedTransaction = null;
    const toolCalls = [];

    // Check for learn memory action
    const memoryMatch = rawReply.match(/ACTION_LEARN_FACT:\s*(\{[\s\S]*?\})/);
    if (memoryMatch && memoryMatch[1]) {
      try {
        const memData = JSON.parse(memoryMatch[1]);
        if (memData.fact) {
          addAIMemoryFact(memData.fact);
          cleanReply = cleanReply.replace(/ACTION_LEARN_FACT:\s*\{[\s\S]*?\}/, "").trim();
          toolCalls.push({
            name: "update_financial_memory",
            status: "success",
            results: { fact: memData.fact, memoryScope }
          });
        }
      } catch (e) {
        console.warn("Could not parse memory action:", e);
      }
    }

    // Check for transaction action
    const actionMatch = rawReply.match(/ACTION_RECORD_TRANSACTION:\s*(\{[\s\S]*?\})/);
    if (actionMatch && actionMatch[1]) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        cleanReply = cleanReply.replace(/ACTION_RECORD_TRANSACTION:\s*\{[\s\S]*?\}/, "").trim();

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
              databaseMode: dbMode
            },
          });

          // Optional Auto WhatsApp Dispatch
          const targetPhone = cfg.recipientPhone;
          if (cfg.autoSendWhatsAppReceipt && targetPhone) {
            try {
              await sendWhatsAppMessage({
                number: targetPhone,
                text: `💳 *TRANSACTION RECORDED IN OPUS*\n\n• *${actionData.description}*\n• *Amount:* ${actionData.type === "income" ? "+" : "-"}$${Number(actionData.amount).toFixed(2)}\n• *Category:* ${actionData.category}\n• *Method:* ${actionData.payment_method || "Card"}\n• *Database:* ${dbMode === 'single' ? 'Single (Unified)' : 'Separate (Workspace)'}\n\n_Auto-recorded by OPUS AI (${activeDetails.badge})_`,
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
      provider: activeDetails.name,
      model: usedModel || activeDetails.model,
      databaseMode: dbMode,
      memoryScope
    };
  } catch (err) {
    console.error("AI Generation Error:", err);
    throw err;
  }
}
