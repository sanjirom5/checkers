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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await onSignup(email, password, username);
    if (error) setError(error.message);
    else onClose();
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Account">
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
    </Modal>
  );
}
