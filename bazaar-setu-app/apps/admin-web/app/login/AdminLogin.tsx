"use client";

import { useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5010";

type Role = "ADMIN" | "SUPPORT";

export function AdminLogin() {
  const [phone, setPhone] = useState("+919000000001");
  const [role, setRole] = useState<Role>("ADMIN");
  const [requestId, setRequestId] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("Use seeded admin +919000000001 or support +919000000002 on free staging.");
  const [busy, setBusy] = useState(false);

  async function startOtp() {
    setBusy(true);
    setMessage("Sending OTP...");
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/otp/start`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, role })
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Could not start OTP.");
      setRequestId(json.data.requestId);
      if (json.data.demoOtp) setOtp(json.data.demoOtp);
      setMessage(json.data.demoOtp ? `Mock OTP received: ${json.data.demoOtp}` : "OTP sent. Enter the code to continue.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OTP start failed.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setBusy(true);
    setMessage("Verifying OTP...");
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, role, requestId, otp })
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? "OTP verify failed.");
      const sessionResponse = await fetch("/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accessToken: json.data.accessToken, refreshToken: json.data.refreshToken })
      });
      if (!sessionResponse.ok) throw new Error("Could not store admin session.");
      window.location.href = "/";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="eyebrow">Bazaar Setu Ops</div>
        <h1 className="title">Admin / Support Login</h1>
        <p className="muted">Login with OTP to unlock protected ops data and actions.</p>
        <label className="form-label">
          Phone
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className="input" />
        </label>
        <label className="form-label">
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as Role)} className="input">
            <option value="ADMIN">Admin</option>
            <option value="SUPPORT">Support</option>
          </select>
        </label>
        <button className="button primary" disabled={busy} onClick={startOtp}>Send OTP</button>
        {requestId ? (
          <>
            <label className="form-label">
              OTP
              <input value={otp} onChange={(event) => setOtp(event.target.value)} className="input" maxLength={6} />
            </label>
            <button className="button primary" disabled={busy || otp.length !== 6} onClick={verifyOtp}>Verify & Enter Ops</button>
          </>
        ) : null}
        <div className="helper">{message}</div>
      </div>
    </div>
  );
}
