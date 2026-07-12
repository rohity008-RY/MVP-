import { colors } from "@bazaarsetu/ui-tokens";
import { Link } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiSend } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth";

const DEMO_CUSTOMER_ID = "demo-customer";

type Address = {
  id: string;
  type: "Home" | "Office" | "Other";
  label: string;
  line: string;
  lat: number;
  lng: number;
};

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const customerId = useAuthStore((state) => state.customerId) ?? DEMO_CUSTOMER_ID;
  const logout = useAuthStore((state) => state.logout);
  const [addresses, setAddresses] = useState<Address[]>([
    { id: "home", type: "Home", label: "Home", line: "Andheri East, Mumbai 400069", lat: 19.1136, lng: 72.8697 },
    { id: "office", type: "Office", label: "Office", line: "BKC, Mumbai 400051", lat: 19.0676, lng: 72.8678 }
  ]);
  const [draftLine, setDraftLine] = useState("");
  const [leadMessage, setLeadMessage] = useState("Become-a-seller lead goes to Admin/Support.");

  function addAddress() {
    if (!draftLine.trim() || addresses.length >= 5) return;
    setAddresses((current) => [
      ...current,
      {
        id: `addr-${Date.now()}`,
        type: "Other",
        label: "Other",
        line: draftLine.trim(),
        lat: 19.076,
        lng: 72.8777
      }
    ]);
    setDraftLine("");
  }

  function editAddress(id: string) {
    setAddresses((current) => current.map((address) => address.id === id ? { ...address, line: `${address.line} · Updated` } : address));
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
                  <Text style={styles.name}>{address.type} · {address.label}</Text>
                  <Text style={styles.meta}>{address.line}</Text>
                  <Text style={styles.meta}>{address.lat}, {address.lng}</Text>
                </View>
                <Pressable onPress={() => editAddress(address.id)} style={styles.smallButton}><Text style={styles.smallButtonText}>Edit</Text></Pressable>
                <Pressable onPress={() => setAddresses((current) => current.filter((item) => item.id !== address.id))} style={styles.smallDanger}><Text style={styles.dangerText}>Remove</Text></Pressable>
              </View>
            ))}
            <TextInput value={draftLine} onChangeText={setDraftLine} placeholder="Add new address" style={styles.input} />
            <Pressable disabled={addresses.length >= 5} onPress={addAddress} style={[styles.primary, addresses.length >= 5 && styles.disabled]}><Text style={styles.primaryText}>Save address</Text></Pressable>
          </Card>
          <Card title="Payments" copy="Admin controls what appears at checkout. Current demo: UPI, cards, wallet, COD." />
          <Card title="Rewards" copy="320 Bazaar Setu points. Admin can enable/disable and set earning rule." />
          <Card title="Become a Seller" copy={leadMessage}>
            <Pressable onPress={submitSellerLead} style={styles.primary}><Text style={styles.primaryText}>Submit seller interest</Text></Pressable>
          </Card>
          {user ? <Pressable onPress={logout} style={styles.logout}><Text style={styles.dangerText}>Logout</Text></Pressable> : null}
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
