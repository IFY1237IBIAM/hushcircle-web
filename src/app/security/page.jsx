"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import HushCircleSpinner from "../../components/HushCircleSpinner";
import {
  BackIcon,
  ShieldIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
} from "../../components/Icons";

const C = {
  bg: "#0F0A1E",
  card: "#1A1330",
  border: "#2D2450",
  accent: "#9B6FD4",
  accentSoft: "#C4A3E8",
  text: "#EDE8F5",
  textMuted: "#8B7FA8",
  success: "#4CAF8F",
  error: "#D4607A",
  warning: "#D4A44C",
  inputBg: "#0F0A1E",
};

const PIN_LENGTH = 6;

function PinInput({ length = PIN_LENGTH, value, onChange }) {
  const refs = useRef([]);

  const pins = value
    .split("")
    .concat(Array(length).fill(""))
    .slice(0, length);

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);

    if (!digit) {
      const next = [...pins];
      next[i] = "";
      onChange(next.join(""));
      return;
    }

    const next = [...pins];
    next[i] = digit;
    onChange(next.join(""));

    if (i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !pins[i] && i > 0) {
      const next = [...pins];
      next[i - 1] = "";
      onChange(next.join(""));
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      {pins.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="password"
          value={digit}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          style={{
            width: 52,
            height: 64,
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            backgroundColor: digit ? C.accent + "11" : C.inputBg,
            border: `1.5px solid ${digit ? C.accent : C.border}`,
            borderRadius: 14,
            outline: "none",
            fontFamily: "monospace",
          }}
        />
      ))}
    </div>
  );
}

export default function SecurityPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [status, setStatus] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [activeSheet, setActiveSheet] = useState(null);

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [currentPw, setCurrentPw] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [spinnerMessage, setSpinnerMessage] = useState("");

  const [error, setError] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    setFetching(true);

    try {
      const res = await api.get("/two-step/status");
      setStatus(res.data);
    } catch (e) {
      console.log("Security load error:", e.message);
    } finally {
      setFetching(false);
    }
  };

  const handleEnable = async () => {
    if (pin.length < PIN_LENGTH) {
      setError(`PIN must be ${PIN_LENGTH} digits.`);
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    if (!currentPw.trim()) {
      setError("Enter your password.");
      return;
    }

    setSubmitting(true);
    setSpinnerMessage("Enabling two-step...");
    setError("");

    try {
      const res = await api.post("/two-step/enable", {
        pin,
        password: currentPw,
      });

      setRecoveryCode(res.data.recoveryCode || "");
      setActiveSheet("recovery");

      await load();
      refreshUser?.();
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not enable two-step."
      );
    } finally {
      setSubmitting(false);
      setSpinnerMessage("");
    }
  };

  const handleDisable = async () => {
    if (!currentPin || !currentPw) {
      setError("Fill in all fields.");
      return;
    }

    setSubmitting(true);
    setSpinnerMessage("Disabling two-step...");
    setError("");

    try {
      await api.post("/two-step/disable", {
        pin: currentPin,
        password: currentPw,
      });

      setActiveSheet(null);
      setCurrentPin("");
      setCurrentPw("");

      await load();
      refreshUser?.();
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not disable."
      );
    } finally {
      setSubmitting(false);
      setSpinnerMessage("");
    }
  };

  const handleChangePin = async () => {
    if (currentPin.length < PIN_LENGTH) {
      setError(`Current PIN must be ${PIN_LENGTH} digits.`);
      return;
    }

    if (pin.length < PIN_LENGTH) {
      setError(`New PIN must be ${PIN_LENGTH} digits.`);
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    if (currentPin === pin) {
      setError("New PIN must be different from your current PIN.");
      return;
    }

    setSubmitting(true);
    setSpinnerMessage("Updating PIN...");
    setError("");

    try {
      await api.post("/two-step/change-pin", {
        currentPin,
        newPin: pin,
      });

      setActiveSheet(null);
      setPin("");
      setConfirmPin("");
      setCurrentPin("");
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not change PIN."
      );
    } finally {
      setSubmitting(false);
      setSpinnerMessage("");
    }
  };

  const openSheet = (sheet) => {
    setActiveSheet(sheet);
    setPin("");
    setConfirmPin("");
    setCurrentPin("");
    setCurrentPw("");
    setError("");
    setRecoveryCode("");
    setShowPw(false);
  };

  const closeSheet = () => {
    if (submitting) return;

    setActiveSheet(null);
    setPin("");
    setConfirmPin("");
    setCurrentPin("");
    setCurrentPw("");
    setError("");
    setRecoveryCode("");
    setShowPw(false);
  };

  const showRecoveryInfo = () => {
    if (status?.recoveryUsed) {
      alert(
        "Your recovery code has already been used. Disable and re-enable two-step verification to generate a new recovery code."
      );
      return;
    }

    alert(
      "Your recovery code was shown when you enabled two-step verification. Store it somewhere safe, such as a password manager. It cannot be displayed again."
    );
  };

  if (loading || !user) return null;

  const enabled = !!status?.isEnabled;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        paddingTop: 56,
        paddingBottom: 80,
      }}
    >
      <Navbar />

      <main
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: C.accent,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            padding: "16px 0",
          }}
        >
          <BackIcon size={18} color={C.accent} />
          Back
        </button>

        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              color: C.text,
              fontFamily: "DM Serif Display,Georgia,serif",
              fontSize: 28,
              margin: 0,
            }}
          >
            Security
          </h1>

          <p
            style={{
              color: C.textMuted,
              fontSize: 13,
              margin: "4px 0 0",
            }}
          >
            Two-step verification & login activity
          </p>
        </div>

        {fetching ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* TWO-STEP STATUS */}
            <div
              style={{
                backgroundColor: enabled
                  ? C.success + "0D"
                  : C.card,
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                border: `1px solid ${
                  enabled ? C.success + "55" : C.border
                }`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: enabled
                      ? C.success + "22"
                      : C.card,
                    border: `1px solid ${
                      enabled ? C.success + "55" : C.border
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldIcon
                    size={26}
                    color={enabled ? C.success : C.textMuted}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        color: C.text,
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      Two-step verification
                    </span>

                    <span
                      style={{
                        backgroundColor: enabled
                          ? C.success + "22"
                          : C.error + "22",
                        color: enabled
                          ? C.success
                          : C.error,
                        borderRadius: 8,
                        padding: "3px 9px",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {enabled ? "ON" : "OFF"}
                    </span>
                  </div>

                  <span
                    style={{
                      color: C.textMuted,
                      fontSize: 13,
                      lineHeight: 18,
                    }}
                  >
                    {enabled
                      ? `PIN required on new sign-ins.${
                          status?.twoStepHint
                            ? ` Hint: "${status.twoStepHint}"`
                            : ""
                        }`
                      : "Require a PIN on top of your password for new sign-ins."}
                  </span>
                </div>
              </div>

              {/* ENABLED ACTIONS */}
              {enabled ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    backgroundColor: C.card,
                  }}
                >
                  <button
                    onClick={() => openSheet("change")}
                    style={actionRow}
                  >
                    <div>
                      <div style={actionTitle}>Change PIN</div>
                      <div style={actionSub}>
                        Update your two-step PIN
                      </div>
                    </div>
                    <span style={chevron}>›</span>
                  </button>

                  <button
                    onClick={showRecoveryInfo}
                    style={actionRow}
                  >
                    <div>
                      <div style={actionTitle}>
                        Recovery code
                      </div>
                      <div style={actionSub}>
                        {status?.recoveryUsed
                          ? "Code used — re-enable to get a new one"
                          : "One-time backup to reset your PIN"}
                      </div>
                    </div>
                    <span
                      style={{
                        ...chevron,
                        color: status?.recoveryUsed
                          ? C.warning
                          : C.textMuted,
                      }}
                    >
                      ›
                    </span>
                  </button>

                  <button
                    onClick={() => openSheet("disable")}
                    style={{
                      ...actionRow,
                      borderBottom: "none",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: C.error,
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        Disable two-step verification
                      </div>

                      <div
                        style={{
                          color: C.textMuted,
                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        Only your password will be required to sign in
                      </div>
                    </div>

                    <span
                      style={{
                        ...chevron,
                        color: C.error,
                      }}
                    >
                      ›
                    </span>
                  </button>
                </div>
              ) : (
                /* DISABLED ACTION */
                <button
                  onClick={() => openSheet("enable")}
                  style={{
                    width: "100%",
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: C.accent,
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Enable two-step verification
                </button>
              )}
            </div>

            {/* SECURITY TIPS */}
            <div
              style={{
                color: C.textMuted,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                margin: "28px 0 8px",
                paddingLeft: 4,
              }}
            >
              Security tips
            </div>

            <div
              style={{
                backgroundColor: C.card,
                borderRadius: 16,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                marginBottom: 48,
              }}
            >
              <SecurityTip
                icon={<ShieldIcon size={20} color={C.accent} />}
                title="Enable two-step"
                sub="Protects you even if your password is compromised"
              />

              <SecurityTip
                icon={<LockIcon size={20} color={C.accentSoft} />}
                title="Save your recovery code"
                sub="Store it in a password manager or write it down"
              />

              <SecurityTip
                last
                icon={<ShieldIcon size={20} color={C.error} />}
                title="Never share your PIN"
                sub="HushCircle staff will never ask for it"
              />
            </div>

            {/* LOGIN ACTIVITY */}
            <div
              style={{
                color: C.textMuted,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              Login Activity
            </div>

            <div
              onClick={() => router.push("/login-activity")}
              style={{
                backgroundColor: C.card,
                borderRadius: 16,
                padding: 16,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: C.accent + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LockIcon size={20} color={C.accent} />
              </div>

              <div style={{ flex: 1 }}>
                <p
                  style={{
                    color: C.text,
                    fontWeight: 700,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  Login activity
                </p>

                <p
                  style={{
                    color: C.textMuted,
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  See where and when your account was accessed
                </p>
              </div>

              <span
                style={{
                  color: C.textMuted,
                  fontSize: 20,
                }}
              >
                ›
              </span>
            </div>
          </>
        )}
      </main>

      {/* MODAL / SHEET */}
      {activeSheet && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={closeSheet}
        >
          <div
            style={{
              backgroundColor: C.card,
              borderRadius: "24px 24px 0 0",
              padding: "24px 20px 40px",
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              overflowY: "auto",
              border: `1px solid ${C.border}`,
              borderBottom: "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: C.border,
                margin: "0 auto 16px",
              }}
            />

            {/* RECOVERY CODE */}
            {activeSheet === "recovery" && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: C.success + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <ShieldIcon size={36} color={C.success} />
                </div>

                <h3
                  style={{
                    color: C.text,
                    fontFamily: "DM Serif Display,Georgia,serif",
                    fontSize: 24,
                    margin: "0 0 8px",
                  }}
                >
                  Two-step enabled! 🎉
                </h3>

                <p
                  style={{
                    color: C.textMuted,
                    fontSize: 14,
                    lineHeight: 1.65,
                    margin: "0 0 20px",
                  }}
                >
                  Save this recovery code securely. It can
                  be used if you forget your PIN.
                </p>

                <div
                  style={{
                    backgroundColor: C.inputBg,
                    borderRadius: 14,
                    padding: 16,
                    border: `1.5px solid ${C.accent}55`,
                    marginBottom: 12,
                  }}
                >
                  <p
                    style={{
                      color: C.accent,
                      fontFamily: "monospace",
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: 4,
                      margin: 0,
                    }}
                  >
                    {recoveryCode}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(recoveryCode);
                  }}
                  style={{
                    backgroundColor: C.border,
                    color: C.text,
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 20px",
                    fontSize: 13,
                    cursor: "pointer",
                    marginBottom: 12,
                  }}
                >
                  Copy code
                </button>

                <button
                  onClick={closeSheet}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: C.accent,
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  I've saved it — done!
                </button>
              </div>
            )}

            {/* ENABLE */}
            {activeSheet === "enable" && (
              <>
                <h3 style={sheetTitle}>
                  Enable two-step verification
                </h3>

                <p style={sheetDescription}>
                  Pick a 6-digit PIN. You'll need it when
                  signing in on a new device.
                </p>

                <p style={fieldLabel}>
                  Your PIN
                </p>

                <PinInput
                  length={PIN_LENGTH}
                  value={pin}
                  onChange={setPin}
                />

                <p style={fieldLabelWithMargin}>
                  Confirm PIN
                </p>

                <PinInput
                  length={PIN_LENGTH}
                  value={confirmPin}
                  onChange={setConfirmPin}
                />

                <p
                  style={{
                    ...fieldLabel,
                    marginTop: 20,
                  }}
                >
                  Your password
                </p>

                <div
                  style={{
                    position: "relative",
                    marginBottom: 20,
                  }}
                >
                  <input
                    type={showPw ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) =>
                      setCurrentPw(e.target.value)
                    }
                    placeholder="Enter your password"
                    style={passwordInput}
                    onFocus={(e) =>
                      (e.target.style.borderColor = C.accent)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = C.border)
                    }
                  />

                  <button
                    onClick={() => setShowPw(!showPw)}
                    style={eyeButton}
                  >
                    {showPw ? (
                      <EyeOffIcon
                        size={18}
                        color={C.textMuted}
                      />
                    ) : (
                      <EyeIcon
                        size={18}
                        color={C.textMuted}
                      />
                    )}
                  </button>
                </div>

                {error && (
                  <p style={errorText}>{error}</p>
                )}

                <div style={buttonRow}>
                  <button
                    onClick={closeSheet}
                    style={outBtn}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleEnable}
                    disabled={
                      submitting ||
                      pin.length < PIN_LENGTH
                    }
                    style={{
                      ...solBtn,
                      opacity:
                        pin.length < PIN_LENGTH ? 0.4 : 1,
                    }}
                  >
                    Enable
                  </button>
                </div>
              </>
            )}

            {/* DISABLE */}
            {activeSheet === "disable" && (
              <>
                <h3 style={sheetTitle}>
                  Disable two-step verification
                </h3>

                <p style={sheetDescription}>
                  Enter your current PIN and password to
                  turn off two-step verification.
                </p>

                <p style={fieldLabel}>
                  Current PIN
                </p>

                <PinInput
                  length={PIN_LENGTH}
                  value={currentPin}
                  onChange={setCurrentPin}
                />

                <p
                  style={{
                    ...fieldLabel,
                    marginTop: 20,
                  }}
                >
                  Your password
                </p>

                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) =>
                    setCurrentPw(e.target.value)
                  }
                  placeholder="Enter your password"
                  style={{
                    ...passwordInput,
                    marginBottom: 20,
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = C.accent)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = C.border)
                  }
                />

                {error && (
                  <p style={errorText}>{error}</p>
                )}

                <div style={buttonRow}>
                  <button
                    onClick={closeSheet}
                    style={outBtn}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDisable}
                    disabled={
                      submitting ||
                      currentPin.length < PIN_LENGTH
                    }
                    style={{
                      ...solBtn,
                      backgroundColor: C.error,
                      opacity:
                        currentPin.length < PIN_LENGTH
                          ? 0.4
                          : 1,
                    }}
                  >
                    Disable
                  </button>
                </div>
              </>
            )}

            {/* CHANGE PIN */}
            {activeSheet === "change" && (
              <>
                <h3 style={sheetTitle}>
                  Change PIN
                </h3>

                <p style={sheetDescription}>
                  Enter your current PIN, then choose a new
                  6-digit PIN.
                </p>

                <p style={fieldLabel}>
                  Current PIN
                </p>

                <PinInput
                  length={PIN_LENGTH}
                  value={currentPin}
                  onChange={setCurrentPin}
                />

                <p style={fieldLabelWithMargin}>
                  New PIN
                </p>

                <PinInput
                  length={PIN_LENGTH}
                  value={pin}
                  onChange={setPin}
                />

                <p style={fieldLabelWithMargin}>
                  Confirm new PIN
                </p>

                <PinInput
                  length={PIN_LENGTH}
                  value={confirmPin}
                  onChange={setConfirmPin}
                />

                {error && (
                  <p
                    style={{
                      ...errorText,
                      marginTop: 16,
                    }}
                  >
                    {error}
                  </p>
                )}

                <div
                  style={{
                    ...buttonRow,
                    marginTop: 20,
                  }}
                >
                  <button
                    onClick={closeSheet}
                    style={outBtn}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleChangePin}
                    disabled={
                      submitting ||
                      currentPin.length < PIN_LENGTH ||
                      pin.length < PIN_LENGTH
                    }
                    style={{
                      ...solBtn,
                      opacity:
                        pin.length < PIN_LENGTH ||
                        currentPin.length < PIN_LENGTH
                          ? 0.4
                          : 1,
                    }}
                  >
                    Save PIN
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HUSH CIRCLE SPINNER */}
      <HushCircleSpinner
        visible={submitting}
        message={spinnerMessage}
      />
    </div>
  );
}

function SecurityTip({ icon, title, sub, last }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderBottom: last
          ? "none"
          : `1px solid ${C.border}`,
      }}
    >
      {icon}

      <div style={{ flex: 1 }}>
        <div
          style={{
            color: C.text,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: C.textMuted,
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        border: "2px solid #9B6FD4",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto",
      }}
    />
  );
}

const actionRow = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  textAlign: "left",
  padding: "14px 16px",
  backgroundColor: "transparent",
  border: "none",
  borderBottom: `1px solid ${C.border}`,
  cursor: "pointer",
};

const actionTitle = {
  color: C.text,
  fontWeight: 600,
  fontSize: 14,
};

const actionSub = {
  color: C.textMuted,
  fontSize: 12,
  marginTop: 3,
};

const chevron = {
  color: C.textMuted,
  fontSize: 20,
};

const sheetTitle = {
  color: C.text,
  fontFamily: "DM Serif Display,Georgia,serif",
  fontSize: 24,
  margin: "0 0 6px",
};

const sheetDescription = {
  color: C.textMuted,
  fontSize: 13,
  margin: "0 0 24px",
  lineHeight: 20,
};

const fieldLabel = {
  color: C.accentSoft,
  fontWeight: 700,
  fontSize: 12,
  marginBottom: 12,
};

const fieldLabelWithMargin = {
  color: C.accentSoft,
  fontWeight: 700,
  fontSize: 12,
  margin: "20px 0 12px",
};

const passwordInput = {
  width: "100%",
  backgroundColor: C.inputBg,
  borderRadius: 14,
  border: `1px solid ${C.border}`,
  padding: "12px 44px 12px 14px",
  color: C.text,
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

const eyeButton = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const errorText = {
  color: C.error,
  fontSize: 13,
  marginBottom: 12,
};

const buttonRow = {
  display: "flex",
  gap: 10,
};

const solBtn = {
  flex: 1,
  padding: "12px 0",
  backgroundColor: C.accent,
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const outBtn = {
  flex: 1,
  padding: "12px 0",
  backgroundColor: "transparent",
  color: C.textMuted,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};