const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const colorOptions = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e"
];

const emojiOptions = ["👨", "👩", "👦", "👧", "🧑", "👶", "👴", "👵"];

export default function AddMemberForm({ member, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "editor",
    color: colorOptions[0],
    avatar: "👨",
    status: "active"
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role,
        color: member.color || colorOptions[0],
        avatar: member.avatar || "👨",
        status: member.status || "active"
      });
    }
  }, [member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      invited_by: currentUser?.email || "system"
    };
    
    if (!member) {
      submitData.joined_date = new Date().toISOString().split('T')[0];
    }
    
    onSubmit(submitData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="mb-8 shadow-lg border-purple-200">
        <CardHeader className="border-b bg-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle>
              {member ? "Edit Member" : "Add Family Member"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Member name"
                  required
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <Label>Permission Level</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      👑 Admin (full access)
                    </SelectItem>
                    <SelectItem value="editor">
                      ✏️ Editor (creates and edits their transactions)
                    </SelectItem>
                    <SelectItem value="viewer">
                      👁️ Viewer (read only)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Avatar</Label>
              <div className="flex gap-2 mt-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: emoji })}
                    className={`w-12 h-12 text-2xl rounded-lg border-2 hover:scale-110 transition-transform ${
                      formData.avatar === emoji ? 'border-purple-500 bg-purple-50' : 'border-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Identification Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg border-2 hover:scale-110 transition-transform ${
                      formData.color === color ? 'border-slate-900' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.avatar}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{formData.name || "Name"}</p>
                  <p className="text-sm text-slate-500">{formData.email || "email@example.com"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {member ? "Update" : "Add Member"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}