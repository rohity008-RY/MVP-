import type { ParentOrder, SupportTicket } from "@bazaarsetu/shared-types";
import { colors } from "@bazaarsetu/ui-tokens";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiGet, apiSend } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth";

const DEMO_CUSTOMER_ID = "demo-customer";

const categories = [
  { id: "late_order", label: "Late order" },
  { id: "missing_item", label: "Missing item" },
  { id: "refund", label: "Refund" },
  { id: "payment", label: "Payment" },
  { id: "seller", label: "Seller issue" }
];

export default function CustomerHelp() {
  const customerId = useAuthStore((state) => state.customerId) ?? DEMO_CUSTOMER_ID;
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const ticketKey = ["customer-support-tickets", customerId] as const;
  const { data: orders = [] } = useQuery({ queryKey: ["orders", customerId], queryFn: () => apiGet<ParentOrder[]>(`/api/customer/${customerId}/orders`) });
  const { data: tickets = [] } = useQuery({ queryKey: ticketKey, queryFn: () => apiGet<SupportTicket[]>(`/api/customer/${customerId}/support-tickets`) });
  const orderOptions = orders.flatMap((order) => order.subOrders.map((subOrder) => ({ parentOrderId: order.id, subOrderId: subOrder.id, label: `${order.id} · ${subOrder.status}` })));
  const [category, setCategory] = useState(categories[0].id);
  const [selectedOrder, setSelectedOrder] = useState(orderOptions[0]);
  const [subject, setSubject] = useState("Need help with my order");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("Support replies appear here and in notifications.");

  async function createTicket() {
    if (!description.trim()) {
      setMessage("Please add a short note so support can help quickly.");
      return;
    }
    const ticket = await apiSend<SupportTicket>(`/api/customer/${customerId}/support-tickets`, "POST", {
      category,
      subject: subject.trim() || "Customer support request",
      description: description.trim(),
      priority: category === "refund" ? "HIGH" : "MEDIUM",
      parentOrderId: selectedOrder?.parentOrderId,
      subOrderId: selectedOrder?.subOrderId,
      preferredContact: user?.phone ? "call" : "app"
    });
    queryClient.setQueryData<SupportTicket[]>(ticketKey, (current = []) => [ticket, ...current]);
    setDescription("");
    setMessage(`Ticket ${ticket.ticketNumber ?? "created"} sent to Bazaar Setu Support.`);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <View style={styles.header}>
          <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
          <Text style={styles.eyebrow}>HELP CENTER</Text>
          <Text style={styles.title}>Tell us what went wrong</Text>
          <Text style={styles.copy}>Order, refund, payment, address, and seller issues go to the Ops support queue.</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.name}>Raise an issue</Text>
            <View style={styles.chips}>
              {categories.map((item) => (
                <Pressable key={item.id} onPress={() => setCategory(item.id)} style={[styles.chip, category === item.id && styles.chipActive]}>
                  <Text style={category === item.id ? styles.chipTextActive : styles.chipText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Related order</Text>
            <View style={styles.chips}>
              {orderOptions.length ? orderOptions.map((option) => (
                <Pressable key={option.subOrderId} onPress={() => setSelectedOrder(option)} style={[styles.chip, selectedOrder?.subOrderId === option.subOrderId && styles.chipActive]}>
                  <Text style={selectedOrder?.subOrderId === option.subOrderId ? styles.chipTextActive : styles.chipText}>{option.label}</Text>
                </Pressable>
              )) : <Text style={styles.meta}>No order yet. You can still raise a general support request.</Text>}
            </View>
            <TextInput value={subject} onChangeText={setSubject} placeholder="Subject" style={styles.input} />
            <TextInput value={description} onChangeText={setDescription} placeholder="Describe the issue" multiline style={[styles.input, styles.textarea]} />
            <Pressable onPress={createTicket} style={styles.primary}><Text style={styles.primaryText}>Send to Support</Text></Pressable>
            <Text style={styles.meta}>{message}</Text>
          </View>

          <Text style={styles.sectionTitle}>Your support tickets</Text>
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
