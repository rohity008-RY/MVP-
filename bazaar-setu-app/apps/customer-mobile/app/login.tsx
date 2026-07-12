import { colors } from "@bazaarsetu/ui-tokens";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { API_BASE_URL } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth";

export default function CustomerLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const [phone, setPhone] = useState("+919876543210");
  const [name, setName] = useState("Rahul Kumar");
  const [requestId, setRequestId] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("Login with OTP to save addresses, rewards, and orders.");
  const [busy, setBusy] = useState(false);

  async function startOtp() {
    setBusy(true);
    setMessage("Sending OTP...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role: "CUSTOMER" })
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Could not start OTP.");
      setRequestId(json.data.requestId);
      if (json.data.demoOtp) setOtp(json.data.demoOtp);
      setMessage(json.data.demoOtp ? `Mock OTP: ${json.data.demoOtp}` : "OTP sent. Enter the code to continue.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OTP start failed.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setBusy(true);
    setMessage("Verifying...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, role: "CUSTOMER", requestId, otp })
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? "OTP verify failed.");
      setSession(json.data);
      router.replace("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
        <Text style={styles.eyebrow}>BAZAAR SETU</Text>
        <Text style={styles.title}>Customer login</Text>
        <Text style={styles.copy}>{message}</Text>
      </View>
      <View style={styles.body}>
        <TextInput value={name} onChangeText={setName} placeholder="Your name" style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Mobile number" style={styles.input} />
        <Pressable disabled={busy} onPress={startOtp} style={styles.primary}><Text style={styles.primaryText}>Send OTP</Text></Pressable>
        {requestId ? (
          <>
            <TextInput value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder="6 digit OTP" style={styles.input} />
            <Pressable disabled={busy || otp.length !== 6} onPress={verifyOtp} style={[styles.primary, otp.length !== 6 && styles.disabled]}>
              <Text style={styles.primaryText}>Verify & continue</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 10 },
  back: { color: colors.brand, fontWeight: "900" },
  eyebrow: { color: colors.brand, fontWeight: "900", letterSpacing: 1 },
  title: { color: "#fff", fontSize: 30, fontWeight: "900" },
  copy: { color: "#AAA", lineHeight: 20 },
  body: { padding: 16, gap: 12 },
  input: { backgroundColor: "#fff", borderRadius: 14, padding: 14, fontWeight: "800" },
  primary: { backgroundColor: colors.brand, borderRadius: 14, padding: 16, alignItems: "center" },
  disabled: { opacity: 0.5 },
  primaryText: { color: "#fff", fontWeight: "900" }
});
