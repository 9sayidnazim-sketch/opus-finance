import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  QrCode,
  RefreshCw,
  Send,
  Smartphone,
  Copy,
  Settings as SettingsIcon,
  Check,
  Server,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  checkGatewayHealth,
  getInstanceStatus,
  connectAndGetQRCode,
  requestPairingCode,
  disconnectWhatsApp,
  sendWhatsAppMessage,
} from "@/api/evolutionWhatsApp";

export default function WhatsAppConnection({ isConnected, onConnectionChange }) {
  const [config, setConfig] = useState(getWhatsAppConfig());
  const [serverHealth, setServerHealth] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [pairModalOpen, setPairModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);

  // QR & Status states
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [connectedUser, setConnectedUser] = useState("");

  // Pairing code state
  const [pairPhone, setPairPhone] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [loadingPair, setLoadingPair] = useState(false);

  // Test message state
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Poll timer ref
  const pollIntervalRef = useRef(null);

  // Check health and status on mount
  useEffect(() => {
    let mounted = true;

    async function checkState() {
      const health = await checkGatewayHealth();
      if (!mounted) return;
      setServerHealth(health.ok);

      if (health.ok) {
        const st = await getInstanceStatus();
        if (!mounted) return;
        if (st.loggedIn) {
          setConnectedUser(st.name || "WhatsApp User");
          onConnectionChange(true);
        } else if (isConnected) {
          // Keep true if prop says so, or update
          onConnectionChange(Boolean(st.loggedIn));
        }
      }
    }

    checkState();
    return () => {
      mounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll for connection while QR modal is open
  useEffect(() => {
    if (!pollingActive || !qrModalOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      const st = await getInstanceStatus();
      if (st.loggedIn) {
        clearInterval(pollIntervalRef.current);
        setPollingActive(false);
        setQrModalOpen(false);
        setConnectedUser(st.name || "WhatsApp User");
        onConnectionChange(true);
        toast.success("WhatsApp connected successfully!");
      }
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [pollingActive, qrModalOpen]);

  const handleStartQRConnect = async () => {
    setLoadingQR(true);
    setQrModalOpen(true);
    try {
      const res = await connectAndGetQRCode();
      if (res.ok && res.qrcode) {
        setQrCodeData(res.qrcode);
        setPollingActive(true);
      } else {
        toast.error(res.error || "Failed to generate QR code. Check server connection.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to reach WhatsApp Gateway.");
    } finally {
      setLoadingQR(false);
    }
  };

  const handleRefreshQR = async () => {
    setLoadingQR(true);
    try {
      const res = await connectAndGetQRCode();
      if (res.ok && res.qrcode) {
        setQrCodeData(res.qrcode);
        toast.success("New QR code generated");
      }
    } catch {
      toast.error("Could not refresh QR code");
    } finally {
      setLoadingQR(false);
    }
  };

  const handleRequestPairing = async (e) => {
    e.preventDefault();
    if (!pairPhone.trim()) {
      toast.error("Enter a valid phone number with country code");
      return;
    }
    setLoadingPair(true);
    try {
      const res = await requestPairingCode(pairPhone);
      if (res.ok && res.pairingCode) {
        setPairingCode(res.pairingCode);
        setPollingActive(true);
        toast.success("Pairing code received! Enter it on WhatsApp.");
      } else {
        toast.error(res.error || "Failed to get pairing code");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingPair(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWhatsApp();
      onConnectionChange(false);
      setConnectedUser("");
      toast.info("WhatsApp disconnected.");
    } catch {
      toast.error("Failed to disconnect.");
    }
  };

  const handleSendTestMessage = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      toast.error("Enter your phone number with country code (e.g. 971501234567)");
      return;
    }
    setSendingTest(true);
    try {
      await sendWhatsAppMessage({
        number: testPhone,
        text: `👋 *OPUS Finance Assistant Connected!*\n\nYour WhatsApp notifications are successfully configured. You will receive real-time budget reminders, bill due-dates, and spending alerts here.\n\n_Sent from OPUS by octtapus_`,
      });
      toast.success("Test notification sent! Check your WhatsApp.");
      setTestModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setSendingTest(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(config.globalApiKey);
    setCopiedKey(true);
    toast.success("Global API Key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleToggleLocal = (useLocal) => {
    const next = saveWhatsAppConfig({ useLocal });
    setConfig(next);
    toast.info(`Switched to ${useLocal ? "Local Access (localhost:4000)" : "Global Cloudflare Access"}`);
  };

  return (
    <Card className="shadow-lg border-2 border-emerald-200 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
              <MessageCircle className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-slate-900">
                  WhatsApp Connection
                </h3>
                {isConnected ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Connected {connectedUser ? `(${connectedUser})` : ""}
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    Not Connected
                  </Badge>
                )}

                {serverHealth !== null && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      serverHealth
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}
                  >
                    <Server className="w-3 h-3 mr-1" />
                    {serverHealth ? "Evolution Gateway Active" : "Gateway Offline"}
                  </Badge>
                )}
              </div>

              <p className="text-slate-600 mb-4 max-w-2xl">
                {isConnected
                  ? "Your WhatsApp is connected to OPUS. You'll receive automatic alerts for budget limits, bills, goals, and weekly summaries."
                  : "Connect your WhatsApp to receive real-time financial alerts and talk to your AI assistant straight from WhatsApp."}
              </p>

              <div className="flex flex-wrap gap-3">
                {!isConnected ? (
                  <>
                    <Button
                      onClick={handleStartQRConnect}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Connect via QR Code
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPairModalOpen(true)}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Connect via Phone Code
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setTestModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Test Alert
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDisconnect}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Disconnect
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <SettingsIcon className="w-4 h-4 mr-1.5" />
                  Gateway Settings
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2">
            <a
              href={config.managerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-slate-700 border-slate-200 hover:bg-slate-100"
              >
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Evolution Web Manager
                <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
              </Button>
            </a>
          </div>
        </div>

        {/* Collapsible Gateway Settings */}
        {settingsOpen && (
          <div className="mt-6 pt-5 border-t border-slate-200/80 bg-slate-50/70 -mx-6 -mb-6 p-6 rounded-b-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                Evolution GO WhatsApp Gateway Details
              </h4>
              <Badge variant="outline" className="text-xs bg-white text-slate-600">
                Port 4000 / Cloudflare Tunnel
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-medium text-slate-500">Public Server URL:</span>
                <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-800 break-all select-all">
                  {config.serverUrl}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-medium text-slate-500">Local URL (Docker):</span>
                <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-800 break-all select-all">
                  {config.fallbackUrl}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">Global API Key:</span>
                  <button
                    onClick={handleCopyKey}
                    className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 font-sans"
                  >
                    {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedKey ? "Copied" : "Copy Key"}
                  </button>
                </div>
                <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-800 select-all">
                  {config.globalApiKey}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Active Routing:</span>
                <Button
                  size="sm"
                  variant={!config.useLocal ? "default" : "outline"}
                  onClick={() => handleToggleLocal(false)}
                  className={`h-7 text-xs ${!config.useLocal ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                >
                  Cloudflare HTTPS
                </Button>
                <Button
                  size="sm"
                  variant={config.useLocal ? "default" : "outline"}
                  onClick={() => handleToggleLocal(true)}
                  className={`h-7 text-xs ${config.useLocal ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                >
                  Localhost (4000)
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={config.swaggerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:underline inline-flex items-center"
                >
                  Swagger Docs
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* QR Code Dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white text-slate-900 sm:rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Scan WhatsApp QR Code
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Link your WhatsApp account to OPUS Finance in 3 simple steps
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 flex flex-col items-center justify-center">
            {loadingQR ? (
              <div className="w-64 h-64 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center bg-emerald-50/50">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
                <p className="text-sm font-medium text-emerald-800">
                  Generating secure QR code...
                </p>
              </div>
            ) : qrCodeData ? (
              <div className="p-3 bg-white border-2 border-emerald-500 rounded-2xl shadow-md">
                <img
                  src={qrCodeData}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64 rounded-xl object-contain"
                />
              </div>
            ) : (
              <div className="w-64 h-64 border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-sm text-slate-600 mb-3">
                  Could not load QR code. Ensure Evolution GO is running.
                </p>
                <Button size="sm" onClick={handleRefreshQR}>
                  Try Again
                </Button>
              </div>
            )}

            {pollingActive && (
              <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Waiting for scan... this updates automatically once scanned.
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1.5">
            <p className="font-semibold text-slate-900">Instructions:</p>
            <p>1. Open WhatsApp on your phone</p>
            <p>2. Go to <strong>Settings</strong> &gt; <strong>Linked Devices</strong> (or tap ⋮ on Android)</p>
            <p>3. Tap <strong>Link a Device</strong> and point your camera at this QR code</p>
          </div>

          <div className="flex justify-between items-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshQR}
              disabled={loadingQR}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQrModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Pairing Code Dialog */}
      <Dialog open={pairModalOpen} onOpenChange={setPairModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Connect with Phone Number
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Receive an 8-character pairing code to connect WhatsApp without camera scanning.
            </DialogDescription>
          </DialogHeader>

          {!pairingCode ? (
            <form onSubmit={handleRequestPairing} className="space-y-4 my-2">
              <div className="space-y-2">
                <Label htmlFor="pairPhone" className="text-xs font-medium text-slate-700">
                  Phone Number (with Country Code)
                </Label>
                <Input
                  id="pairPhone"
                  placeholder="e.g. 971501234567 or 5511999999999"
                  value={pairPhone}
                  onChange={(e) => setPairPhone(e.target.value)}
                  className="font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Include international prefix without + or spaces.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPairModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loadingPair}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loadingPair ? "Generating..." : "Get Pairing Code"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="my-4 space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <p className="text-xs text-emerald-800 mb-1 font-medium">Your Pairing Code:</p>
                <p className="font-mono text-3xl font-bold tracking-widest text-emerald-700 select-all">
                  {pairingCode}
                </p>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>1. Open WhatsApp &gt; <strong>Linked Devices</strong></p>
                <p>2. Tap <strong>Link with phone number instead</strong></p>
                <p>3. Enter the 8-character code shown above</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => setPairModalOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Notification Dialog */}
      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Send Test WhatsApp Notification
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Verify your WhatsApp connection by sending a real notification to your phone.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendTestMessage} className="space-y-4 my-2">
            <div className="space-y-2">
              <Label htmlFor="testPhone" className="text-xs font-medium text-slate-700">
                Destination Phone Number (with Country Code)
              </Label>
              <Input
                id="testPhone"
                placeholder="e.g. 971501234567"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Enter your WhatsApp phone number including country code without + or spaces.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
              <p className="font-medium text-slate-800 mb-1">Message Preview:</p>
              <p className="italic">
                "👋 OPUS Finance Assistant Connected! Your WhatsApp notifications are successfully configured..."
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendingTest}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {sendingTest ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
