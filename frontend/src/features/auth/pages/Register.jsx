import RegisterForm from "../components/RegisterForm";

export default function Register() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create a new account</h2>

        <RegisterForm />
      </div>
    </div>
  );
}
