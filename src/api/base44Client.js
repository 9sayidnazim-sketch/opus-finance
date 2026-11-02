import { format } from "date-fns";

const isBrowser = typeof window !== "undefined";

const getStorageKey = (entityName) => `b44_data_${entityName.toLowerCase()}`;

// Generate sample dates around current month
const now = new Date();
const currentMonthPrefix = format(now, "yyyy-MM");
const currentMonth01 = `${currentMonthPrefix}-01`;

const defaultInitialData = {
  transaction: [
    {
      id: "tx-1",
      type: "receita",
      amount: 4500,
      category: "salario",
      description: "Monthly Salary",
      date: `${currentMonthPrefix}-05`,
      payment_method: "transferencia",
      payment_status: "pago",
      recurring: true,
      recurring_day: 5,
      created_date: new Date().toISOString()
    },
    {
      id: "tx-2",
      type: "receita",
      amount: 850,
      category: "freelance",
      description: "Consulting Project",
      date: `${currentMonthPrefix}-12`,
      payment_method: "pix",
      payment_status: "pago",
      recurring: false,
      created_date: new Date().toISOString()
    },
    {
      id: "tx-3",
      type: "despesa",
      amount: 1200,
      category: "moradia",
      description: "Apartment Rent",
      date: `${currentMonthPrefix}-08`,
      due_date: `${currentMonthPrefix}-10`,
      payment_method: "transferencia",
      payment_status: "pago",
      recurring: true,
      recurring_day: 10,
      created_date: new Date().toISOString()
    },
    {
      id: "tx-4",
      type: "despesa",
      amount: 380,
      category: "alimentacao",
      description: "Supermarket Weekly Groceries",
      date: `${currentMonthPrefix}-07`,
      payment_method: "cartao_credito",
      payment_status: "pago",
      recurring: false,
      created_date: new Date().toISOString()
    },
    {
      id: "tx-5",
      type: "despesa",
      amount: 145,
      category: "contas",
      description: "Electricity & Water Utilities",
      date: `${currentMonthPrefix}-15`,
      due_date: `${currentMonthPrefix}-25`,
      payment_method: "cartao_debito",
      payment_status: "a_pagar",
      recurring: true,
      recurring_day: 25,
      created_date: new Date().toISOString()
    },
    {
      id: "tx-6",
      type: "despesa",
      amount: 120,
      category: "transporte",
      description: "Fuel & Transportation Pass",
      date: `${currentMonthPrefix}-09`,
      payment_method: "cartao_debito",
      payment_status: "pago",
      recurring: false,
      created_date: new Date().toISOString()
    },
    {
      id: "tx-7",
      type: "despesa",
      amount: 85,
      category: "contas",
      description: "High-Speed Internet & Fiber",
      date: `${currentMonthPrefix}-14`,
      due_date: `${currentMonthPrefix}-22`,
      payment_method: "cartao_credito",
      payment_status: "a_pagar",
      recurring: true,
      recurring_day: 22,
      created_date: new Date().toISOString()
    },
    {
      id: "tx-8",
      type: "despesa",
      amount: 95,
      category: "lazer",
      description: "Family Dinner Out",
      date: `${currentMonthPrefix}-16`,
      payment_method: "cartao_credito",
      payment_status: "pago",
      recurring: false,
      created_date: new Date().toISOString()
    }
  ],
  budget: [
    {
      id: "bd-1",
      category: "alimentacao",
      amount: 600,
      month: currentMonth01,
      alert_threshold: 80,
      active: true,
      created_date: new Date().toISOString()
    },
    {
      id: "bd-2",
      category: "moradia",
      amount: 1300,
      month: currentMonth01,
      alert_threshold: 90,
      active: true,
      created_date: new Date().toISOString()
    },
    {
      id: "bd-3",
      category: "transporte",
      amount: 250,
      month: currentMonth01,
      alert_threshold: 80,
      active: true,
      created_date: new Date().toISOString()
    },
    {
      id: "bd-4",
      category: "contas",
      amount: 300,
      month: currentMonth01,
      alert_threshold: 85,
      active: true,
      created_date: new Date().toISOString()
    },
    {
      id: "bd-5",
      category: "lazer",
      amount: 250,
      month: currentMonth01,
      alert_threshold: 80,
      active: true,
      created_date: new Date().toISOString()
    }
  ],
  goal: [
    {
      id: "gl-1",
      title: "Emergency Reserve",
      description: "6 months of living expenses safety fund",
      target_amount: 10000,
      current_amount: 5200,
      target_date: "2027-06-30",
      status: "em_progresso",
      icon: "Sparkles",
      color: "bg-emerald-500",
      created_date: new Date().toISOString()
    },
    {
      id: "gl-2",
      title: "Family European Holiday",
      description: "Flights, accommodation and itinerary",
      target_amount: 4500,
      current_amount: 1800,
      target_date: "2027-04-15",
      status: "em_progresso",
      icon: "Plane",
      color: "bg-blue-500",
      created_date: new Date().toISOString()
    },
    {
      id: "gl-3",
      title: "Vehicle Upgrade Downpayment",
      description: "Deposit for a newer family car",
      target_amount: 8000,
      current_amount: 3100,
      target_date: "2027-09-30",
      status: "em_progresso",
      icon: "Car",
      color: "bg-orange-500",
      created_date: new Date().toISOString()
    }
  ],
  familymember: [
    {
      id: "fm-1",
      name: "Alex Silva",
      email: "alex@opusfinance.app",
      user_email: "alex@opusfinance.app",
      role: "admin",
      color: "#6366f1",
      avatar: "👨‍💼",
      status: "active",
      active: true,
      joined_date: `${currentMonthPrefix}-01`,
      created_date: new Date().toISOString()
    },
    {
      id: "fm-2",
      name: "Mariana Silva",
      email: "mariana@opusfinance.app",
      user_email: "mariana@opusfinance.app",
      role: "editor",
      color: "#ec4899",
      avatar: "👩‍💼",
      status: "active",
      active: true,
      joined_date: `${currentMonthPrefix}-02`,
      created_date: new Date().toISOString()
    }
  ],
  notificationsettings: [
    {
      id: "ns-1",
      budget_alerts_enabled: true,
      budget_alert_threshold: 80,
      goal_deadline_alerts_enabled: true,
      goal_deadline_days: 7,
      large_transaction_alerts_enabled: true,
      large_transaction_threshold: 500,
      bill_due_alerts_enabled: true,
      bill_due_days_before: 2,
      bill_due_day_alert: true,
      weekly_summary_enabled: true,
      weekly_summary_day: "domingo",
      monthly_summary_enabled: true,
      monthly_summary_day: 1,
      whatsapp_connected: false,
      notifications_channel: "whatsapp",
      created_date: new Date().toISOString()
    }
  ]
};

function readItems(entityName) {
  if (!isBrowser) return defaultInitialData[entityName.toLowerCase()] || [];
  const key = getStorageKey(entityName);
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  const defaults = defaultInitialData[entityName.toLowerCase()] || [];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

function writeItems(entityName, items) {
  if (!isBrowser) return;
  const key = getStorageKey(entityName);
  localStorage.setItem(key, JSON.stringify(items));
}

function sortItems(items, sortKey) {
  if (!sortKey || !Array.isArray(items)) return items;
  const isDesc = sortKey.startsWith("-");
  const field = isDesc ? sortKey.substring(1) : sortKey;
  return [...items].sort((a, b) => {
    const valA = a?.[field] ?? "";
    const valB = b?.[field] ?? "";
    if (valA < valB) return isDesc ? 1 : -1;
    if (valA > valB) return isDesc ? -1 : 1;
    return 0;
  });
}

function filterItems(items, query) {
  if (!query || typeof query !== "object") return items;
  return items.filter((item) => {
    for (const [key, val] of Object.entries(query)) {
      if (item[key] !== val) return false;
    }
    return true;
  });
}

function createEntityHandler(entityName) {
  return {
    async list(sortKey) {
      const items = readItems(entityName);
      return sortItems(items, sortKey);
    },
    async filter(query, sortKey) {
      const items = readItems(entityName);
      const matched = filterItems(items, query);
      return sortItems(matched, sortKey);
    },
    async get(id) {
      const items = readItems(entityName);
      return items.find((item) => item.id === id) || null;
    },
    async create(data) {
      const items = readItems(entityName);
      const newItem = {
        id: `${entityName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        created_date: new Date().toISOString(),
        ...data
      };
      items.unshift(newItem);
      writeItems(entityName, items);
      return newItem;
    },
    async update(id, data) {
      const items = readItems(entityName);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error(`Item ${id} not found`);
      }
      const updated = {
        ...items[index],
        ...data,
        updated_date: new Date().toISOString()
      };
      items[index] = updated;
      writeItems(entityName, items);
      return updated;
    },
    async delete(id) {
      const items = readItems(entityName);
      const filtered = items.filter((item) => item.id !== id);
      writeItems(entityName, filtered);
      return { success: true };
    },
    async bulkCreate(arrayData) {
      const items = readItems(entityName);
      const newItems = arrayData.map((d) => ({
        id: `${entityName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        created_date: new Date().toISOString(),
        ...d
      }));
      items.unshift(...newItems);
      writeItems(entityName, items);
      return newItems;
    },
    async count(query) {
      const items = readItems(entityName);
      return filterItems(items, query).length;
    }
  };
}

const entityCache = {};
const entitiesProxy = new Proxy(
  {},
  {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (!entityCache[prop]) {
        entityCache[prop] = createEntityHandler(prop);
      }
      return entityCache[prop];
    }
  }
);

// Agent conversations support
const conversationListeners = new Map();

function readConversations() {
  if (!isBrowser) return [];
  const raw = localStorage.getItem("b44_conversations");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  const defaultConv = [
    {
      id: "conv-1",
      agent_name: "assistente_financeiro",
      metadata: { name: "Finance Planning & Overview" },
      created_date: new Date().toISOString(),
      messages: [
        {
          role: "assistant",
          content: "Hello Alex! I am your OPUS personal finance assistant. I can help you record expenses, check budget limits, forecast bill due dates, or analyze your savings progress. How can I assist your finances today?",
          created_date: new Date().toISOString()
        }
      ]
    }
  ];
  localStorage.setItem("b44_conversations", JSON.stringify(defaultConv));
  return defaultConv;
}

function writeConversations(convs) {
  if (!isBrowser) return;
  localStorage.setItem("b44_conversations", JSON.stringify(convs));
}

function generateAssistantReply(userText) {
  const lower = userText.toLowerCase();
  const txs = readItems("Transaction");
  const income = txs.filter((t) => t.type === "receita").reduce((acc, t) => acc + (t.amount || 0), 0);
  const expenses = txs.filter((t) => t.type === "despesa").reduce((acc, t) => acc + (t.amount || 0), 0);
  const balance = income - expenses;
  const pendingBills = txs.filter((t) => t.payment_status === "a_pagar" && t.due_date);

  if (lower.includes("bill") || lower.includes("due") || lower.includes("conta")) {
    if (pendingBills.length === 0) {
      return "All your scheduled bills are paid up to date! Great job keeping your accounts organized.";
    }
    const details = pendingBills.map((b) => `• **${b.description}**: $${b.amount.toFixed(2)} (due: ${b.due_date})`).join("\n");
    return `You have ${pendingBills.length} pending bill(s):\n\n${details}\n\nMake sure to settle them on time to avoid late fees!`;
  }

  if (lower.includes("balance") || lower.includes("saldo") || lower.includes("total")) {
    return `Here is your current financial summary:\n\n• **Total Income**: $${income.toLocaleString("en-US", { minimumFractionDigits: 2 })}\n• **Total Expenses**: $${expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}\n• **Net Balance**: $${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  }

  if (lower.includes("budget") || lower.includes("limit")) {
    const budgets = readItems("Budget");
    const summaries = budgets.map((b) => {
      const spent = txs.filter((t) => t.category === b.category && t.type === "despesa").reduce((acc, t) => acc + (t.amount || 0), 0);
      const pct = Math.round((spent / b.amount) * 100);
      return `• **${b.category}**: $${spent}/$${b.amount} (${pct}%)`;
    }).join("\n");
    return `Here is your current budget status:\n\n${summaries}`;
  }

  if (lower.includes("goal") || lower.includes("meta")) {
    const goals = readItems("Goal");
    const summaries = goals.map((g) => {
      const pct = Math.round((g.current_amount / g.target_amount) * 100);
      return `• **${g.title}**: $${g.current_amount}/$${g.target_amount} (${pct}%)`;
    }).join("\n");
    return `Your active financial goals progress:\n\n${summaries}`;
  }

  return `I've noted that! You currently have **$${balance.toFixed(2)}** in net balance across recorded transactions. Would you like me to log a new expense or review upcoming bills?`;
}

export const db = {
  auth: {
    isAuthenticated: async () => true,
    me: async () => ({
      id: "usr_1",
      name: "Alex Silva",
      email: "alex@opusfinance.app",
      role: "admin"
    }),
    logout: (redirectUrl) => {
      if (isBrowser) {
        if (redirectUrl) window.location.href = redirectUrl;
        else window.location.reload();
      }
    },
    redirectToLogin: (url) => {
      if (isBrowser) window.location.href = url || "/";
    }
  },
  entities: entitiesProxy,
  agents: {
    async listConversations({ agent_name } = {}) {
      const convs = readConversations();
      if (!agent_name) return convs;
      return convs.filter((c) => c.agent_name === agent_name);
    },
    async createConversation({ agent_name = "assistente_financeiro", metadata = {} } = {}) {
      const convs = readConversations();
      const newConv = {
        id: `conv-${Date.now()}`,
        agent_name,
        metadata,
        created_date: new Date().toISOString(),
        messages: [
          {
            role: "assistant",
            content: "Hello! How can I assist with your personal and family finances today?",
            created_date: new Date().toISOString()
          }
        ]
      };
      convs.unshift(newConv);
      writeConversations(convs);
      return newConv;
    },
    async getConversation(id) {
      const convs = readConversations();
      return convs.find((c) => c.id === id) || null;
    },
    subscribeToConversation(id, callback) {
      if (!conversationListeners.has(id)) {
        conversationListeners.set(id, new Set());
      }
      conversationListeners.get(id).add(callback);

      return () => {
        const set = conversationListeners.get(id);
        if (set) {
          set.delete(callback);
          if (set.size === 0) conversationListeners.delete(id);
        }
      };
    },
    async addMessage(conversation, message) {
      const convId = typeof conversation === "string" ? conversation : conversation.id;
      const convs = readConversations();
      const target = convs.find((c) => c.id === convId);
      if (!target) return;

      const userMsg = {
        ...message,
        id: `msg-${Date.now()}`,
        created_date: new Date().toISOString()
      };
      target.messages.push(userMsg);
      writeConversations(convs);

      // Notify immediate user message
      const listeners = conversationListeners.get(convId);
      if (listeners) {
        listeners.forEach((cb) => cb({ messages: [...target.messages] }));
      }

      // Simulate intelligent AI assistant response after a short realistic latency
      setTimeout(() => {
        const replyText = generateAssistantReply(message.content || "");
        const assistantMsg = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: replyText,
          created_date: new Date().toISOString()
        };
        target.messages.push(assistantMsg);
        writeConversations(convs);

        if (listeners) {
          listeners.forEach((cb) => cb({ messages: [...target.messages] }));
        }
      }, 350);

      return userMsg;
    },
    getWhatsAppConnectURL(agentName = "assistente_financeiro") {
      const text = encodeURIComponent("Hi! I'd like to manage my finances with OPUS Assistant.");
      return `https://wa.me/?text=${text}`;
    },
    async sendWhatsAppNotification({ number, text }) {
      try {
        const { sendWhatsAppMessage } = await import("@/api/evolutionWhatsApp");
        return await sendWhatsAppMessage({ number, text });
      } catch (e) {
        console.warn("Could not send WhatsApp notification:", e);
        return { error: e.message };
      }
    }
  },
  appLogs: {
    async logUserInApp(pageName) {
      // In local mode, log quietly
      return { success: true, page: pageName };
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const url = typeof file === "string" ? file : isBrowser ? URL.createObjectURL(file) : "";
        return { file_url: url };
      }
    }
  }
};

// Expose globally so components using globalThis.__B44_DB__ use this immediately
if (typeof globalThis !== "undefined") {
  globalThis.__B44_DB__ = db;
}

export const base44 = db;
export default db;
