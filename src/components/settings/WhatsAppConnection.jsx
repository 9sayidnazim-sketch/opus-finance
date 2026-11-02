import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

export default function WhatsAppConnection({ isConnected, whatsappURL, onConnectionChange }) {
  return (
    <Card className="shadow-lg border-2 border-emerald-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <MessageCircle className="w-8 h-8 text-emerald-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-slate-900">
                WhatsApp Connection
              </h3>
              {isConnected ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>
            
            <p className="text-slate-600 mb-4">
              {isConnected 
                ? "Your WhatsApp is connected and you'll receive automatic notifications according to your settings."
                : "Connect your WhatsApp to receive automatic notifications about budgets, goals and financial summaries."
              }
            </p>

            <div className="flex gap-3">
              {!isConnected ? (
                <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect WhatsApp
                  </Button>
                </a>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onConnectionChange(false)}
                >
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </div>

        {!isConnected && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">
              📱 How to connect:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 ml-4">
              <li>1. Click "Connect WhatsApp"</li>
              <li>2. Scan the QR Code with your WhatsApp</li>
              <li>3. Confirm the connection</li>
              <li>4. Done! You'll start receiving notifications</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}