import { config } from "./config.js";
import { ApiError } from "./http.js";

interface SendOtpInput {
  phone: string;
  code: string;
  requestId: string;
}

interface SendOtpResult {
  providerMessageId?: string;
  demoOtp?: string;
}

export async function sendOtp(input: SendOtpInput): Promise<SendOtpResult> {
  if (config.otpDeliveryMode === "mock" || (config.demoAuthEnabled && !config.otpProviderUrl)) {
    return { providerMessageId: `mock-${input.requestId}`, demoOtp: input.code };
  }

  if (!config.otpProviderUrl || !config.otpProviderApiKey) {
    throw new ApiError(501, "OTP provider is not configured.", "OTP_PROVIDER_NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.otpProviderTimeoutMs);
  let response: Response;

  try {
    response = await fetch(config.otpProviderUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.otpProviderApiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        phone: input.phone,
        otp: input.code,
        sender: config.otpProviderSender,
        requestId: input.requestId,
        message: `${input.code} is your Bazaar Setu login OTP. It expires in ${Math.floor(config.otpTtlSeconds / 60)} minutes.`
      })
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(504, "OTP provider timed out.", "OTP_PROVIDER_TIMEOUT");
    }
    throw new ApiError(502, "OTP provider request failed.", "OTP_PROVIDER_SEND_FAILED");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new ApiError(502, "OTP provider rejected the send request.", "OTP_PROVIDER_SEND_FAILED");
  }

  const payload = (await response.json().catch(() => ({}))) as { messageId?: string; id?: string };
  return { providerMessageId: payload.messageId ?? payload.id };
}
