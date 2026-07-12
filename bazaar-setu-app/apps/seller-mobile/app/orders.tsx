import { SellerSubOrder } from "@bazaarsetu/shared-types";
import { colors } from "@bazaarsetu/ui-tokens";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiDocument, apiGet, apiSend } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth";

const DEMO_SELLER_ID = "demo-seller-fresh";

type MobileSellerSubOrder = Omit<SellerSubOrder, "status" | "paymentState"> & {
  status: string;
  paymentState: string;
};

export default function SellerOrders() {
  const sellerId = useAuthStore((state) => state.sellerId) ?? DEMO_SELLER_ID;
  const query = useQuery({ queryKey: ["seller-orders", sellerId], queryFn: () => apiGet<MobileSellerSubOrder[]>(`/api/seller/${sellerId}/orders`) });

  async function action(subOrderId: string, nextAction: string, payload: Record<string, string> = {}) {
    await apiSend(`/api/seller/${sellerId}/orders/${subOrderId}`, "PATCH", { action: nextAction, reason: "Seller app action", ...payload });
    await query.refetch();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Orders" />
      <View style={styles.body}>
        {(query.data ?? []).map((order) => (
          <View style={styles.card} key={order.id}>
            <Text style={styles.name}>{order.id}</Text>
            <Text style={styles.meta}>{order.status} · {order.paymentState} · Invoice {order.invoiceNumber ?? "pending"}</Text>
            {order.items.map((item) => <Text key={item.productId} style={styles.meta}>{item.name} x {item.qty}</Text>)}
            <OrderActions order={order} sellerId={sellerId} onAction={action} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

function OrderActions({ order, sellerId, onAction }: { order: MobileSellerSubOrder; sellerId: string; onAction: (id: string, action: string, payload?: Record<string, string>) => Promise<void> }) {
  const [rejectReason, setRejectReason] = useState("Out of stock");
  const [invoiceNumber, setInvoiceNumber] = useState(`MAN-${Date.now().toString(36).toUpperCase().slice(-6)}`);
  const [format, setFormat] = useState<"a4" | "a5" | "4x6" | "80mm">("a4");
  const [printMessage, setPrintMessage] = useState("");

  async function generateDocument(type: "invoice" | "label") {
    try {
      const result = await apiDocument(`/api/seller/${sellerId}/orders/${order.id}/document?type=${type}&format=${format}`);
      setPrintMessage(`${type} PDF ready · ${format.toUpperCase()} · ${Math.max(1, Math.round(result.bytes / 1024))} KB`);
    } catch (error) {
      setPrintMessage(error instanceof Error ? error.message : "Document generation failed.");
    }
  }

  if (order.status === "PLACED") {
    return (
      <View style={styles.actionStack}>
        <View style={styles.row}>
          <Pressable style={styles.primary} onPress={() => onAction(order.id, "confirm")}><Text style={styles.primaryText}>Confirm</Text></Pressable>
          <Pressable style={styles.danger} onPress={() => onAction(order.id, "reject", { reason: rejectReason })}><Text style={styles.dangerText}>Reject</Text></Pressable>
        </View>
        <TextInput value={rejectReason} onChangeText={setRejectReason} placeholder="Rejection note" style={styles.input} />
      </View>
    );
  }

  if (order.status === "INVOICE_REQUIRED") {
    return (
      <View style={styles.actionStack}>
        <TextInput value={invoiceNumber} onChangeText={setInvoiceNumber} placeholder="Invoice number" style={styles.input} />
        <Pressable style={styles.primary} onPress={() => onAction(order.id, "addInvoice", { invoiceNumber })}><Text style={styles.primaryText}>Add invoice</Text></Pressable>
      </View>
    );
  }

  if (order.status === "BAG_PACKED") {
    return (
      <View style={styles.actionStack}>
        <View style={styles.formatRow}>
          {(["a4", "a5", "4x6", "80mm"] as const).map((value) => (
            <Pressable key={value} onPress={() => setFormat(value)} style={[styles.formatChip, format === value && styles.formatChipActive]}>
              <Text style={format === value ? styles.formatTextActive : styles.formatText}>{value.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <Pressable style={styles.print} onPress={() => generateDocument("invoice")}><Text style={styles.printText}>Print invoice</Text></Pressable>
          <Pressable style={styles.print} onPress={() => generateDocument("label")}><Text style={styles.printText}>Print label</Text></Pressable>
          <Pressable style={styles.primary} onPress={() => onAction(order.id, "handover")}><Text style={styles.primaryText}>Handover</Text></Pressable>
        </View>
        {printMessage ? <Text style={styles.meta}>{printMessage}</Text> : null}
      </View>
    );
  }

  if (order.status === "HANDED_OVER") {
    return <Pressable style={styles.primary} onPress={() => onAction(order.id, "delivered")}><Text style={styles.primaryText}>Mark delivered</Text></Pressable>;
  }

  return <Text style={styles.meta}>Closed lane. No seller action required.</Text>;
}

function Header({ title }: { title: string }) {
  return <View style={styles.header}><Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link><Text style={styles.title}>{title}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  body: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 8 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted },
  row: { flexDirection: "row", gap: 8 },
  actionStack: { gap: 8 },
  input: { backgroundColor: "#F6F5F2", borderRadius: 12, padding: 12, fontWeight: "800" },
  primary: { flex: 1, backgroundColor: colors.green, borderRadius: 12, padding: 12, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "900" },
  danger: { flex: 1, backgroundColor: "#FCEBEB", borderRadius: 12, padding: 12, alignItems: "center" },
  dangerText: { color: colors.red, fontWeight: "900" },
  print: { flex: 1, backgroundColor: "#F1EFEA", borderRadius: 12, padding: 12, alignItems: "center" },
  printText: { color: colors.brandDark, fontWeight: "900" },
  formatRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  formatChip: { borderWidth: 1, borderColor: "#E6E2D8", borderRadius: 10, paddingVertical: 7, paddingHorizontal: 9 },
  formatChipActive: { borderColor: colors.brand, backgroundColor: "#FFF2EB" },
  formatText: { color: colors.textMuted, fontWeight: "800", fontSize: 11 },
  formatTextActive: { color: colors.brandDark, fontWeight: "900", fontSize: 11 }
});
