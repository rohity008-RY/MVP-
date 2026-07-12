import { colors } from "@bazaarsetu/ui-tokens";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { apiGet } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth";

const DEMO_SELLER_ID = "demo-seller-fresh";

type SellerProduct = {
  id: string;
  active: boolean;
  qty: number;
  price: number;
  tags?: string[];
  product: { name: string; unit: string; hsn?: string | null };
};

export default function SellerProducts() {
  const sellerId = useAuthStore((state) => state.sellerId) ?? DEMO_SELLER_ID;
  const { data } = useQuery({
    queryKey: ["seller-products", sellerId],
    queryFn: () => apiGet<SellerProduct[]>(`/api/seller/${sellerId}/products`)
  });
  const products = data ?? [];
  const liveProducts = products.filter((product) => product.active);
  const lowStock = products.filter((product) => product.qty > 0 && product.qty <= 5);

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Products" />
      <FlatList
        contentContainerStyle={styles.body}
        data={products}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.statRow}>
              <MiniStat label="Live" value={String(liveProducts.length)} />
              <MiniStat label="Low stock" value={String(lowStock.length)} />
              <MiniStat label="Catalogue" value="60+" />
            </View>
            <Section title="Catalogue flow" copy="Seller selects products from master catalogue, then only updates price, qty, tags, and active state." />
            <Section title="Add new product request" copy="Upload/capture product photo, AI extracts basic details, then Admin approves before it goes live." />
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.product.name}</Text>
                <Text style={styles.meta}>{item.product.unit} · HSN {item.product.hsn ?? "Optional"}</Text>
              </View>
              <Text style={item.active ? styles.live : styles.inactive}>{item.active ? "Live" : "Off"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.price}>Rs. {item.price}</Text>
              <Text style={item.qty <= 5 ? styles.lowStock : styles.stock}>{item.qty} in stock</Text>
            </View>
            <Text style={styles.meta}>{(item.tags ?? []).join(" · ") || "No tags"}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function Header({ title }: { title: string }) {
  return <View style={styles.header}><Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link><Text style={styles.title}>{title}</Text></View>;
}

function Section({ title, copy }: { title: string; copy: string }) {
  return <View style={styles.card}><Text style={styles.name}>{title}</Text><Text style={styles.meta}>{copy}</Text></View>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.miniStat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  body: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 8 },
  statRow: { flexDirection: "row", gap: 8 },
  miniStat: { flex: 1, backgroundColor: colors.brandDark, borderRadius: 14, padding: 12 },
  statValue: { color: "#fff", fontWeight: "900", fontSize: 18 },
  statLabel: { color: "#AAA", fontWeight: "800", fontSize: 11 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted },
  price: { color: colors.brandDark, fontWeight: "900" },
  stock: { color: colors.green, fontWeight: "900" },
  lowStock: { color: colors.red, fontWeight: "900" },
  live: { color: colors.green, fontWeight: "900" },
  inactive: { color: colors.red, fontWeight: "900" }
});
