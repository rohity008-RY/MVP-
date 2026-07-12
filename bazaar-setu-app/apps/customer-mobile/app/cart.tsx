import { colors } from "@bazaarsetu/ui-tokens";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { apiGet, apiSend } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth";
import { useCart } from "../src/store/cart";

const DEMO_CUSTOMER_ID = "demo-customer";
const DEMO_ADDRESS_ID = "demo-home-address";

export default function CartScreen() {
  const cart = useCart();
  const customerId = useAuthStore((state) => state.customerId) ?? DEMO_CUSTOMER_ID;
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("razorpay-upi");
  const { data: addresses = [] } = useQuery({
    queryKey: ["checkout-addresses", customerId],
    queryFn: () => apiGet<Array<{ id: string; label: string; line1: string; city: string; pincode: string }>>(`/api/customer/${customerId}/addresses`)
  });
  const { data: config } = useQuery({
    queryKey: ["customer-config"],
    queryFn: () => apiGet<{ paymentConfig: { vendors: Array<{ id: string; label: string; enabled: boolean }> } }>("/api/customer/config")
  });
  const paymentMethods = config?.paymentConfig.vendors.filter((vendor) => vendor.enabled) ?? [
    { id: "razorpay-upi", label: "UPI via Razorpay", enabled: true },
    { id: "cod", label: "Cash on Delivery", enabled: true }
  ];
  const addressId = selectedAddressId || addresses[0]?.id || DEMO_ADDRESS_ID;
  const paymentMethod = paymentMethods.some((method) => method.id === selectedPaymentMethod) ? selectedPaymentMethod : paymentMethods[0]?.id ?? "razorpay-upi";
  const total = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = cart.items.length ? 29 : 0;
  const grandTotal = total + deliveryFee;

  async function checkout() {
    await apiSend(`/api/customer/${customerId}/orders`, "POST", {
      addressId,
      paymentMethod,
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
          <View>
            <Text style={styles.summaryText}>Items Rs. {total}</Text>
            <Text style={styles.summaryText}>Delivery Rs. {deliveryFee}</Text>
            <Text style={styles.summaryHint}>Selected address: {addresses.find((address) => address.id === addressId)?.label ?? "Demo Home"}</Text>
            <Text style={styles.summaryHint}>Payment: {paymentMethods.find((method) => method.id === paymentMethod)?.label ?? paymentMethod}</Text>
          </View>
          <Text style={styles.summaryTotal}>Rs. {grandTotal}</Text>
        </View>
        <View style={styles.optionCard}>
          <Text style={styles.name}>Delivery address</Text>
          {addresses.map((address) => (
            <Pressable key={address.id} onPress={() => setSelectedAddressId(address.id)} style={[styles.chip, addressId === address.id && styles.chipActive]}>
              <Text style={addressId === address.id ? styles.chipTextActive : styles.chipText}>{address.label} · {address.city}</Text>
            </Pressable>
          ))}
          {!addresses.length ? <Text style={styles.meta}>No saved address found. Demo checkout uses Home.</Text> : null}
        </View>
        <View style={styles.optionCard}>
          <Text style={styles.name}>Payment method</Text>
          {paymentMethods.map((method) => (
            <Pressable key={method.id} onPress={() => setSelectedPaymentMethod(method.id)} style={[styles.chip, paymentMethod === method.id && styles.chipActive]}>
              <Text style={paymentMethod === method.id ? styles.chipTextActive : styles.chipText}>{method.label}</Text>
            </Pressable>
          ))}
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
  optionCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 8 },
  chip: { borderWidth: 1, borderColor: "#E6E2D8", borderRadius: 12, padding: 11 },
  chipActive: { borderColor: colors.brand, backgroundColor: "#FFF2EB" },
  chipText: { color: colors.textMuted, fontWeight: "800" },
  chipTextActive: { color: colors.brandDark, fontWeight: "900" },
  qty: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#F1EFEA", alignItems: "center", justifyContent: "center" },
  qtyText: { fontWeight: "900" },
  summary: { backgroundColor: colors.brandDark, borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between" },
  summaryText: { color: "#fff", fontWeight: "900" },
  summaryHint: { color: "#AAA", fontSize: 11, marginTop: 4 },
  summaryTotal: { color: colors.brand, fontWeight: "900", fontSize: 18 },
  checkout: { backgroundColor: colors.brand, borderRadius: 14, padding: 16, alignItems: "center" },
  disabled: { opacity: 0.45 },
  checkoutText: { color: "#fff", fontWeight: "900" }
});
