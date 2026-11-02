import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Mail, CheckCircle, Clock, Shield, Edit, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

const roleConfig = {
  admin: {
    label: "Admin",
    icon: Shield,
    color: "bg-red-100 text-red-700 border-red-200"
  },
  editor: {
    label: "Editor",
    icon: Edit,
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "bg-slate-100 text-slate-700 border-slate-200"
  }
};

export default function MemberCard({ member, onEdit, onDelete }) {
  const isPending = member.status === 'pending';
  const roleInfo = roleConfig[member.role] || roleConfig.editor;
  const RoleIcon = roleInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={`hover:shadow-lg transition-all ${isPending ? 'border-orange-200 bg-orange-50' : 'border-slate-200'}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{ backgroundColor: member.color || '#6366f1' }}
              >
                {member.avatar || member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">
                  {member.name}
                </h3>
                <p className="text-sm text-slate-500 truncate">
                  {member.email}
                </p>
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(member)}
                className="flex-shrink-0"
              >
                <Pencil className="w-4 h-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(member.id)}
                className="flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={roleInfo.color}>
                <RoleIcon className="w-3 h-3 mr-1" />
                {roleInfo.label}
              </Badge>
              
              {isPending ? (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>

            {member.joined_date && (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Joined {format(new Date(member.joined_date), "MMM d", { locale: enUS })}
              </div>
            )}

            {isPending && member.invited_by && (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Invited by {member.invited_by}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-600">
              <strong>Permissions:</strong>
              <ul className="mt-1 space-y-1">
                {member.role === 'admin' && (
                  <>
                    <li>• Manage all members</li>
                    <li>• Edit all transactions</li>
                    <li>• Manage budgets and goals</li>
                  </>
                )}
                {member.role === 'editor' && (
                  <>
                    <li>• Create their own transactions</li>
                    <li>• Edit their transactions</li>
                    <li>• View family data</li>
                  </>
                )}
                {member.role === 'viewer' && (
                  <>
                    <li>• View transactions</li>
                    <li>• View reports</li>
                    <li>• No editing permission</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}