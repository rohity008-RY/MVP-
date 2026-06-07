import { ParentOrder } from "@bazaarsetu/shared-types";
import { colors } from "@bazaarsetu/ui-tokens";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { apiGet } from "../src/lib/api";

const DEMO_CUSTOMER_ID = "demo-customer";

export default function OrdersScreen() {
  const { data } = useQuery({ queryKey: ["orders"], queryFn: () => apiGet<ParentOrder[]>(`/api/customer/${DEMO_CUSTOMER_ID}/orders`) });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
        <Text style={styles.title}>Orders</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.id}</Text>
            <Text style={styles.meta}>{item.status} · {item.paymentState} · Rs. {item.total}</Text>
            {item.subOrders?.map((subOrder) => <Text key={subOrder.id} style={styles.sub}>{subOrder.id} · {subOrder.status}</Text>)}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 6 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted },
  sub: { color: colors.brandDark, fontWeight: "700" }
});
