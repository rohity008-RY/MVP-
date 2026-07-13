import type { Category, ProductMaster } from "@bazaarsetu/shared-types";
import { colors } from "@bazaarsetu/ui-tokens";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiGet } from "../src/lib/api";
import { useCart } from "../src/store/cart";
import { useAuthStore } from "../src/store/auth";

interface HomePayload {
  categories: Category[];
  products: Array<ProductMaster & { sellerProducts?: Array<{ id: string; price: number }> }>;
}

export default function CustomerHome() {
  const [query, setQuery] = useState("");
  const cart = useCart();
  const loggedIn = useAuthStore((state) => Boolean(state.accessToken));
  const { data } = useQuery({ queryKey: ["customer-home"], queryFn: () => apiGet<HomePayload>("/api/customer/home") });
  const products = (data?.products ?? []).filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CUSTOMER</Text>
        <Text style={styles.title}>Shop fresh local essentials</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search tomato, milk, rice" placeholderTextColor="#8F8FAC" style={styles.search} />
        <View style={styles.navRow}>
          <Link href="/cart" asChild><Pressable style={styles.navButton}><Text style={styles.navText}>Cart ({cart.items.length})</Text></Pressable></Link>
          <Link href="/orders" asChild><Pressable style={styles.navButton}><Text style={styles.navText}>Orders</Text></Pressable></Link>
          <Link href="/help" asChild><Pressable style={styles.navButton}><Text style={styles.navText}>Help</Text></Pressable></Link>
          <Link href="/profile" asChild><Pressable style={styles.navButton}><Text style={styles.navText}>Profile</Text></Pressable></Link>
          {!loggedIn ? <Link href="/login" asChild><Pressable style={styles.navButtonAlt}><Text style={styles.navTextAlt}>Login</Text></Pressable></Link> : null}
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>Shop by category</Text>
            <FlatList
              horizontal
              data={data?.categories ?? []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <View style={styles.categoryChip}><Text style={styles.categoryIcon}>{item.icon.slice(0, 2).toUpperCase()}</Text><Text style={styles.categoryLabel}>{item.name}</Text></View>}
              showsHorizontalScrollIndicator={false}
            />
            <Text style={styles.sectionTitle}>Products near you</Text>
          </View>
        }
        renderItem={({ item }) => {
          const sellerProduct = item.sellerProducts?.[0];
          const price = sellerProduct?.price ?? Number(item.legalMetrology?.mrp ?? 0);
          return (
            <View style={styles.productCard}>
              <View style={styles.productMedia}><Text style={styles.productInitial}>{item.name.slice(0, 2).toUpperCase()}</Text></View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productMeta}>{item.unit} · HSN {item.hsn ?? "Optional"}</Text>
              <View style={styles.productFooter}>
                <Text style={styles.price}>Rs. {price}</Text>
                <Pressable
                  style={styles.addButton}
                  onPress={() => cart.add({ sellerProductId: sellerProduct?.id ?? item.id, productId: item.id, name: item.name, unit: item.unit, price })}
                >
                  <Text style={styles.addText}>Add</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { backgroundColor: colors.brandDark, padding: 18, gap: 12 },
  eyebrow: { color: colors.brand, fontWeight: "800", letterSpacing: 1 },
  title: { color: "#fff", fontSize: 30, fontWeight: "900" },
  search: { backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 14, padding: 14 },
  navRow: { flexDirection: "row", gap: 8 },
  navButton: { backgroundColor: colors.brand, borderRadius: 12, padding: 10 },
  navButtonAlt: { backgroundColor: "#fff", borderRadius: 12, padding: 10 },
  navText: { color: "#fff", fontWeight: "800" },
  navTextAlt: { color: colors.brandDark, fontWeight: "900" },
  sectionTitle: { margin: 16, fontSize: 18, fontWeight: "900" },
  categoryChip: { width: 82, marginLeft: 16, alignItems: "center", gap: 6 },
  categoryIcon: { backgroundColor: "#fff", borderRadius: 16, padding: 18, fontWeight: "900" },
  categoryLabel: { fontSize: 11, textAlign: "center" },
  productCard: { flex: 1, margin: 8, backgroundColor: "#fff", borderRadius: 16, padding: 12, gap: 6 },
  productMedia: { height: 92, borderRadius: 14, backgroundColor: "#FAEEDA", alignItems: "center", justifyContent: "center" },
  productInitial: { fontWeight: "900", fontSize: 20 },
  productName: { fontWeight: "900" },
  productMeta: { color: colors.textMuted, fontSize: 12 },
  productFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontWeight: "900" },
  addButton: { backgroundColor: colors.brand, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10 },
  addText: { color: "#fff", fontWeight: "900" }
});
