import { useState } from "react";
import { Modal } from "../UI/Modal";
import { Button } from "../UI/Button";
import s from "./AuthForm.module.css";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null }>;
  onGoogle: () => void;
  onSwitchToSignup: () => void;
}

export function LoginModal({
  open,
  onClose,
  onLogin,
  onGoogle,
  onSwitchToSignup,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await onLogin(email, password);
    if (error) setError(error.message);
    else onClose();
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Sign In">
      <form onSubmit={handleSubmit} className={s.form}>
        <input
          className={s.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={s.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className={s.error}>{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          style={{ width: "100%", marginTop: "0.25rem" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <div className={s.divider}>
          <div className={s.dividerLine} />
          <div className={s.dividerText}>
            <span>or</span>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onGoogle}
          style={{ width: "100%" }}
        >
          Continue with Google
        </Button>
        <p className={s.switchText}>
          No account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className={s.switchLink}
          >
            Sign up
          </button>
        </p>
      </form>
    </Modal>
  );
}
