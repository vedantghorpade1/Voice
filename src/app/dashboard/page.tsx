'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useState } from "react";
import { useConversation } from "@elevenlabs/react";

// Icons
import { PhoneCall, Bot, MessageSquare, Database, BarChart, CreditCard, Plus } from "lucide-react";

// Dashboard nav items
const navItems = [
  { icon: <PhoneCall className="h-6 w-6" />, label: "Calls", href: "/dashboard/calls", description: "Manage voice calls & history", section: "AI Voice System" },
  { icon: <Bot className="h-6 w-6" />, label: "AI Agents", href: "/dashboard/agents", description: "Create & configure voice AI", section: "AI Voice System" },
  { icon: <MessageSquare className="h-6 w-6" />, label: "Call History", href: "/dashboard/calls/history", description: "Review transcripts & logs", section: "AI Voice System" },
  { icon: <Database className="h-6 w-6" />, label: "Knowledge Base", href: "/dashboard/knowledge", description: "Manage AI training data", section: "Business Management" },
  { icon: <BarChart className="h-6 w-6" />, label: "Analytics", href: "/dashboard/analytics", description: "View usage insights & reports", section: "Business Management" },
  { icon: <CreditCard className="h-6 w-6" />, label: "Billing", href: "/dashboard/billing", description: "Manage subscriptions & payments", section: "Business Management" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // ------------------ ElevenLabs Conversation ------------------
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const conversation = useConversation({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onMessage: (msg) => console.log("🧠 Agent:", msg),
    onError: (err) => console.error("❌ Error:", err),
  });

  const startConversation = async () => {
    try {
      setLoading(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await fetch("/api/signed-url");
      const { signedUrl } = await res.json();
      await conversation.startSession({ signedUrl, connectionType: "websocket" });
      console.log("✅ Connected via WebSocket");
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const stopConversation = async () => {
    await conversation.endSession();
    console.log("🛑 Conversation ended");
  };
  // -------------------------------------------------------------

  // ------------------ Call via AI Agent ------------------
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callLoading, setCallLoading] = useState(false);

  const makeCall = async () => {
    if (!phoneNumber) return alert("Enter phone number!");
    setCallLoading(true);
    try {
      const res = await fetch("/api/make-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phoneNumber, message: "Hello! This is a message from your AI agent." }),
      });
      const data = await res.json();
      if (data.success) alert("Call initiated! SID: " + data.sid);
      else alert("Error: " + data.error);
    } catch (err) {
      console.error(err);
      alert("Call failed.");
    } finally {
      setCallLoading(false);
    }
  };
  // -------------------------------------------------------------

  // Group nav sections
  const sections = navItems.reduce((acc, item) => {
    const section = item.section || "General";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 sm:px-6 py-8">

          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F3FFD4]">Welcome back, {user?.name || "User"}!</h1>
              <p className="text-[#A7A7A7] mt-1">Here's your command center. What would you like to do today?</p>
            </div>
            <Button onClick={() => router.push("/dashboard/new-agent")} className="gap-2 bg-[#A7B3AC] text-[#111111] hover:bg-[#A7B3AC]/90 font-bold">
              <Plus className="h-4 w-4" /> Create New Agent
            </Button>
          </motion.div>

          {/* Navigation Cards */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
            {Object.entries(sections).map(([sectionTitle, items]) => (
              <section key={sectionTitle}>
                <motion.h2 variants={itemVariants} className="text-xl font-semibold text-[#F3FFD4] mb-4">{sectionTitle}</motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <motion.div key={item.href} variants={itemVariants}>
                      <Link href={item.href} className="h-full">
                        <Card className="h-full flex flex-col bg-[#1a1a1a] border-[#333333] hover:border-[#A7B3AC] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#A7B3AC]/10">
                          <CardHeader className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-[#A7B3AC]/10 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                            <div><CardTitle className="text-lg text-[#F3FFD4]">{item.label}</CardTitle></div>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <CardDescription className="text-[#A7A7A7]">{item.description}</CardDescription>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </motion.div>

          {/* ElevenLabs Conversation */}
          <Separator className="my-12 bg-[#333333]" />
          <section className="text-center">
            <h2 className="text-xl font-semibold text-[#F3FFD4] mb-6">🎙️ Live Agent Conversation</h2>
            <div className="flex flex-col items-center gap-4">
              <button onClick={startConversation} disabled={loading || connected} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Connecting..." : connected ? "Connected" : "Start Conversation"}
              </button>
              {connected && (
                <button onClick={stopConversation} className="px-6 py-3 bg-red-500 text-white rounded-lg shadow hover:bg-red-600">End Conversation</button>
              )}
            </div>
          </section>

          {/* Make Call */}
          <Separator className="my-12 bg-[#333333]" />
          <section className="text-center">
            <h2 className="text-xl font-semibold text-[#F3FFD4] mb-4">📞 Call via AI Agent</h2>
            <div className="flex flex-col items-center gap-3">
              <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter phone number" className="px-4 py-2 rounded-lg text-white w-64"/>
              <button onClick={makeCall} disabled={callLoading} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50">
                {callLoading ? "Calling..." : "Call via Agent"}
              </button>
            </div>
            
          </section>

        </div>
      </main>
    </div>
  );
}
