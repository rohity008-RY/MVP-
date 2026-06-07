import { colors } from "@bazaarsetu/ui-tokens";
import { Link } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { apiSend } from "../src/lib/api";
import { useCart } from "../src/store/cart";

const DEMO_CUSTOMER_ID = "demo-customer";
const DEMO_ADDRESS_ID = "demo-home-address";

export default function CartScreen() {
  const cart = useCart();
  const total = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  async function checkout() {
    await apiSend(`/api/customer/${DEMO_CUSTOMER_ID}/orders`, "POST", {
      addressId: DEMO_ADDRESS_ID,
      paymentMethod: "upi",
      items: cart.items.map((item) => ({ sellerProductId: item.sellerProductId, qty: item.qty }))
    });
    cart.clear();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
        <Text style={styles.title}>Your cart</Text>
      </View>
      <View style={styles.body}>
        {cart.items.map((item) => (
          <View style={styles.line} key={item.sellerProductId}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.unit} · Rs. {item.price}</Text>
            </View>
            <Pressable onPress={() => cart.updateQty(item.sellerProductId, -1)} style={styles.qty}><Text>-</Text></Pressable>
            <Text style={styles.qtyText}>{item.qty}</Text>
            <Pressable onPress={() => cart.updateQty(item.sellerProductId, 1)} style={styles.qty}><Text>+</Text></Pressable>
          </View>
        ))}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Total</Text>
          <Text style={styles.summaryTotal}>Rs. {total}</Text>
        </View>
        <Pressable disabled={!cart.items.length} onPress={checkout} style={[styles.checkout, !cart.items.length && styles.disabled]}>
          <Text style={styles.checkoutText}>Place order</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  body: { padding: 16, gap: 12 },
  line: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 10 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted },
  qty: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#F1EFEA", alignItems: "center", justifyContent: "center" },
  qtyText: { fontWeight: "900" },
  summary: { backgroundColor: colors.brandDark, borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between" },
  summaryText: { color: "#fff", fontWeight: "900" },
  summaryTotal: { color: colors.brand, fontWeight: "900", fontSize: 18 },
  checkout: { backgroundColor: colors.brand, borderRadius: 14, padding: 16, alignItems: "center" },
  disabled: { opacity: 0.45 },
  checkoutText: { color: "#fff", fontWeight: "900" }
});
