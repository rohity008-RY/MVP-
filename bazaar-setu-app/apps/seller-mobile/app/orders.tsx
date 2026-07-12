import { SellerSubOrder } from "@bazaarsetu/shared-types";
import { colors } from "@bazaarsetu/ui-tokens";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { apiGet, apiSend } from "../src/lib/api";

const DEMO_SELLER_ID = "demo-seller-fresh";

export default function SellerOrders() {
  const query = useQuery({ queryKey: ["seller-orders"], queryFn: () => apiGet<SellerSubOrder[]>(`/api/seller/${DEMO_SELLER_ID}/orders`) });

  async function action(subOrderId: string, nextAction: string) {
    await apiSend(`/api/seller/${DEMO_SELLER_ID}/orders/${subOrderId}`, "PATCH", { action: nextAction, reason: "Seller app action" });
    await query.refetch();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Orders" />
      <View style={styles.body}>
        {(query.data ?? []).map((order) => (
          <View style={styles.card} key={order.id}>
            <Text style={styles.name}>{order.id}</Text>
            <Text style={styles.meta}>{order.status} · {order.paymentState}</Text>
            {order.items.map((item) => <Text key={item.productId} style={styles.meta}>{item.name} x {item.qty}</Text>)}
            <View style={styles.row}>
              <Pressable style={styles.primary} onPress={() => action(order.id, "confirm")}><Text style={styles.primaryText}>Confirm</Text></Pressable>
              <Pressable style={styles.danger} onPress={() => action(order.id, "reject")}><Text style={styles.dangerText}>Reject</Text></Pressable>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
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
  primary: { flex: 1, backgroundColor: colors.green, borderRadius: 12, padding: 12, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "900" },
  danger: { flex: 1, backgroundColor: "#FCEBEB", borderRadius: 12, padding: 12, alignItems: "center" },
  dangerText: { color: colors.red, fontWeight: "900" }
});
