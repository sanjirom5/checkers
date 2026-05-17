import { useState } from "react";
import { Modal } from "../UI/Modal";
import { Button } from "../UI/Button";
import s from "./AuthForm.module.css";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onSignup: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ error: Error | null }>;
  onSwitchToLogin: () => void;
}

export function SignupModal({
  open,
  onClose,
  onSignup,
  onSwitchToLogin,
}: SignupModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await onSignup(email, password, username);
    if (error) setError(error.message);
    else setConfirmed(true);
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Account">
      {confirmed ? (
        <div className={s.form}>
          <p className={s.confirmText}>
            Account created! Check your email to confirm before signing in.
          </p>
          <Button
            onClick={onClose}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={s.form}>
          <input
            className={s.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
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
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className={s.error}>{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.25rem" }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
          <p className={s.switchText}>
            Have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className={s.switchLink}
            >
              Sign in
            </button>
          </p>
        </form>
      )}
    </Modal>
  );
}
