import LoginForm from "../components/LoginForm";

export default function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login to your account</h2>

        <LoginForm />
      </div>
    </div>
  );
}
