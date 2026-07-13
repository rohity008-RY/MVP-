import { colors } from "@bazaarsetu/ui-tokens";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiGet, apiSend, logoutSession } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth";

const DEMO_CUSTOMER_ID = "demo-customer";

type Address = {
  id: string;
  type: "home" | "office" | "other";
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
};

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const customerId = useAuthStore((state) => state.customerId) ?? DEMO_CUSTOMER_ID;
  const queryClient = useQueryClient();
  const addressQueryKey = ["customer-addresses", customerId] as const;
  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: addressQueryKey,
    queryFn: () => apiGet<Address[]>(`/api/customer/${customerId}/addresses`)
  });
  const [draftLine, setDraftLine] = useState("");
  const [draftLabel, setDraftLabel] = useState("Other");
  const [leadMessage, setLeadMessage] = useState("Become-a-seller lead goes to Admin/Support.");
  const [addressMessage, setAddressMessage] = useState("Address uses Google Maps lat/lng in production; demo saves Mumbai coordinates.");

  async function addAddress() {
    if (!draftLine.trim() || addresses.length >= 5) return;
    const address = await apiSend<Address>(`/api/customer/${customerId}/addresses`, "POST", {
      type: "other",
      label: draftLabel.trim() || "Other",
      line1: draftLine.trim(),
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      lat: 19.076,
      lng: 72.8777
    });
    queryClient.setQueryData<Address[]>(addressQueryKey, (current = []) => [...current, address]);
    setDraftLine("");
    setAddressMessage("Address saved. You can edit or remove it anytime.");
    if (user) void refetchAddresses();
  }

  async function editAddress(address: Address) {
    const nextLine = `${address.line1} · Updated`;
    await apiSend(`/api/customer/${customerId}/addresses/${address.id}`, "PUT", {
      line1: nextLine,
      lat: Number(address.lat),
      lng: Number(address.lng)
    });
    queryClient.setQueryData<Address[]>(addressQueryKey, (current = []) =>
      current.map((item) => item.id === address.id ? { ...item, line1: nextLine } : item)
    );
    setAddressMessage(`${address.label} updated.`);
    if (user) void refetchAddresses();
  }

  async function removeAddress(id: string) {
    await apiSend(`/api/customer/${customerId}/addresses/${id}`, "DELETE", {});
    queryClient.setQueryData<Address[]>(addressQueryKey, (current = []) => current.filter((address) => address.id !== id));
    setAddressMessage("Address removed.");
    if (user) void refetchAddresses();
  }

  async function submitSellerLead() {
    await apiSend(`/api/customer/${customerId}/seller-leads`, "POST", {
      name: user?.name ?? "Customer lead",
      phone: user?.phone ?? "+919876543210",
      notes: "Interested in selling through Bazaar Setu app."
    });
    setLeadMessage("Lead submitted. Support can now contact this customer from Admin.");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <View style={styles.header}>
          <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.copy}>Addresses, payments, rewards, support, and seller interest.</Text>
          {user ? <Text style={styles.session}>Logged in as {user.name ?? "Customer"} · {user.phone}</Text> : <Link href="/login" asChild><Pressable style={styles.login}><Text style={styles.loginText}>Login with OTP</Text></Pressable></Link>}
        </View>
        <View style={styles.body}>
          <Card title="Saved addresses" copy={`${addresses.length}/5 saved. Each address stores Google Maps lat/lng in production.`}>
            {addresses.map((address) => (
              <View style={styles.address} key={address.id}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{address.type.toUpperCase()} · {address.label}</Text>
                  <Text style={styles.meta}>{address.line1}</Text>
                  <Text style={styles.meta}>{address.city}, {address.pincode}</Text>
                  <Text style={styles.meta}>{address.lat}, {address.lng}</Text>
                </View>
                <Pressable onPress={() => editAddress(address)} style={styles.smallButton}><Text style={styles.smallButtonText}>Edit</Text></Pressable>
                <Pressable onPress={() => removeAddress(address.id)} style={styles.smallDanger}><Text style={styles.dangerText}>Remove</Text></Pressable>
              </View>
            ))}
            <Text style={styles.meta}>{addressMessage}</Text>
            <TextInput value={draftLabel} onChangeText={setDraftLabel} placeholder="Address label" style={styles.input} />
            <TextInput value={draftLine} onChangeText={setDraftLine} placeholder="Add new address" style={styles.input} />
            <Pressable disabled={addresses.length >= 5} onPress={addAddress} style={[styles.primary, addresses.length >= 5 && styles.disabled]}><Text style={styles.primaryText}>Save address</Text></Pressable>
          </Card>
          <Card title="Payments" copy="Admin controls what appears at checkout. Current demo: UPI, cards, wallet, COD." />
          <Card title="Rewards" copy="320 Bazaar Setu points. Admin can enable/disable and set earning rule." />
          <Card title="Help & Support" copy="Raise order, refund, payment, address, or seller issues with Bazaar Setu Support.">
            <Link href="/help" asChild><Pressable style={styles.primary}><Text style={styles.primaryText}>Open Help Center</Text></Pressable></Link>
          </Card>
          <Card title="Become a Seller" copy={leadMessage}>
            <Pressable onPress={submitSellerLead} style={styles.primary}><Text style={styles.primaryText}>Submit seller interest</Text></Pressable>
          </Card>
          {user ? <Pressable onPress={logoutSession} style={styles.logout}><Text style={styles.dangerText}>Logout</Text></Pressable> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ title, copy, children }: { title: string; copy: string; children?: ReactNode }) {
  return <View style={styles.card}><Text style={styles.name}>{title}</Text><Text style={styles.meta}>{copy}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  copy: { color: "#AAA" },
  session: { color: "#fff", fontWeight: "800" },
  body: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 10 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted },
  address: { flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: "#F0EEE8", paddingTop: 10 },
  input: { backgroundColor: "#F6F5F2", borderRadius: 12, padding: 12, fontWeight: "800" },
  login: { backgroundColor: colors.brand, borderRadius: 12, padding: 12, alignSelf: "flex-start" },
  loginText: { color: "#fff", fontWeight: "900" },
  primary: { backgroundColor: colors.brand, borderRadius: 12, padding: 12, alignItems: "center" },
  disabled: { opacity: 0.5 },
  primaryText: { color: "#fff", fontWeight: "900" },
  smallButton: { backgroundColor: "#F1EFEA", borderRadius: 10, padding: 9 },
  smallButtonText: { color: colors.brandDark, fontWeight: "900" },
  smallDanger: { backgroundColor: "#FCEBEB", borderRadius: 10, padding: 9 },
  dangerText: { color: colors.red, fontWeight: "900" },
  logout: { backgroundColor: "#FCEBEB", borderRadius: 14, padding: 14, alignItems: "center" }
});
