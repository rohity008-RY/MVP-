import type { SellerSubOrder, SupportTicket } from "@bazaarsetu/shared-types";
import { colors } from "@bazaarsetu/ui-tokens";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiGet, apiSend } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth";

const DEMO_SELLER_ID = "demo-seller-fresh";

type MobileSellerSubOrder = Omit<SellerSubOrder, "status" | "paymentState"> & {
  status: string;
  paymentState: string;
};

const categories = [
  { id: "order_issue", label: "Order issue" },
  { id: "delivery_exception", label: "Pickup / delivery" },
  { id: "print_issue", label: "Invoice / label" },
  { id: "payout_issue", label: "Payout" },
  { id: "catalogue_issue", label: "Catalogue" },
  { id: "document_issue", label: "Documents" }
];

export default function SellerHelp() {
  const sellerId = useAuthStore((state) => state.sellerId) ?? DEMO_SELLER_ID;
  const queryClient = useQueryClient();
  const ticketKey = ["seller-support-tickets", sellerId] as const;
  const { data: orders = [] } = useQuery({ queryKey: ["seller-orders", sellerId], queryFn: () => apiGet<MobileSellerSubOrder[]>(`/api/seller/${sellerId}/orders`) });
  const { data: tickets = [] } = useQuery({ queryKey: ticketKey, queryFn: () => apiGet<SupportTicket[]>(`/api/seller/${sellerId}/support-tickets`) });
  const [category, setCategory] = useState(categories[1].id);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(orders[0]?.id);
  const [subject, setSubject] = useState("Need Ops support");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("Support will reply here and can notify customer if needed.");

  async function createTicket() {
    if (!description.trim()) {
      setMessage("Add a short note so Ops knows exactly what to check.");
      return;
    }
    const ticket = await apiSend<SupportTicket>(`/api/seller/${sellerId}/support-tickets`, "POST", {
      category,
      subject: subject.trim() || "Seller support request",
      description: description.trim(),
      priority: category === "delivery_exception" || category === "payout_issue" ? "HIGH" : "MEDIUM",
      subOrderId: selectedOrderId,
      preferredContact: "app"
    });
    queryClient.setQueryData<SupportTicket[]>(ticketKey, (current = []) => [ticket, ...current]);
    setDescription("");
    setMessage(`Ticket ${ticket.ticketNumber ?? "created"} sent to Ops.`);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <View style={styles.header}>
          <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
          <Text style={styles.eyebrow}>SELLER SUPPORT</Text>
          <Text style={styles.title}>Get help from Ops</Text>
          <Text style={styles.copy}>Use this for pickup, invoice, payout, catalogue, document, or order processing blockers.</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.name}>Raise seller escalation</Text>
            <View style={styles.chips}>
              {categories.map((item) => (
                <Pressable key={item.id} onPress={() => setCategory(item.id)} style={[styles.chip, category === item.id && styles.chipActive]}>
                  <Text style={category === item.id ? styles.chipTextActive : styles.chipText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Related order</Text>
            <View style={styles.chips}>
              {orders.map((order) => (
                <Pressable key={order.id} onPress={() => setSelectedOrderId(order.id)} style={[styles.chip, selectedOrderId === order.id && styles.chipActive]}>
                  <Text style={selectedOrderId === order.id ? styles.chipTextActive : styles.chipText}>{order.id} · {order.status}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput value={subject} onChangeText={setSubject} placeholder="Subject" style={styles.input} />
            <TextInput value={description} onChangeText={setDescription} placeholder="What should Ops check?" multiline style={[styles.input, styles.textarea]} />
            <Pressable onPress={createTicket} style={styles.primary}><Text style={styles.primaryText}>Send to Ops</Text></Pressable>
            <Text style={styles.meta}>{message}</Text>
          </View>

          <Text style={styles.sectionTitle}>Open support cases</Text>
          {tickets.map((ticket) => (
            <View style={styles.card} key={ticket.id}>
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{ticket.ticketNumber}</Text>
                <Text style={styles.status}>{ticket.status}</Text>
              </View>
              <Text style={styles.meta}>{ticket.subject}</Text>
              <Text style={styles.meta}>Priority {ticket.priority} · {ticket.subOrderId ?? "General"}</Text>
              {ticket.messages?.slice(-2).map((item) => <Text key={item.id} style={styles.message}>{item.authorRole}: {item.message}</Text>)}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 10 },
  back: { color: colors.brand, fontWeight: "900" },
  eyebrow: { color: colors.brand, fontWeight: "900", letterSpacing: 1 },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  copy: { color: "#AAA" },
  body: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  name: { fontWeight: "900" },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  meta: { color: colors.textMuted },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: "900" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#E6E2D8", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 },
  chipActive: { borderColor: colors.brand, backgroundColor: "#FFF2EB" },
  chipText: { color: colors.textMuted, fontWeight: "800", fontSize: 12 },
  chipTextActive: { color: colors.brandDark, fontWeight: "900", fontSize: 12 },
  input: { backgroundColor: "#F6F5F2", borderRadius: 12, padding: 12, fontWeight: "800" },
  textarea: { minHeight: 88, textAlignVertical: "top" },
  primary: { backgroundColor: colors.brand, borderRadius: 12, padding: 13, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "900" },
  status: { color: colors.brand, fontWeight: "900", fontSize: 12 },
  message: { borderLeftWidth: 3, borderLeftColor: "#E6E2D8", paddingLeft: 8, color: colors.brandDark, fontWeight: "700" }
});
