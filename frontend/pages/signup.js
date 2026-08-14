import { useState } from "react";
import { signup } from "../services/auth";

const SignupPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await signup({ username, password });
            window.location.href = "/home";
        } catch (e) {
            setError(
                e?.response?.data?.errors?.[0]?.message ||
                e?.message ||
                "Unable to create account."
            );
        } finally {
            setLoading(false);
        }
    };

    return <>
        <style jsx global>{`
            html, body {
                background: #f2f4f5;
                color: #393b3d;
                font-family: "Source Sans Pro", Arial, sans-serif;
            }
        `}</style>

        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: "70px",
            background: "#f2f4f5"
        }}>
            <div style={{
                width: "420px",
                maxWidth: "calc(100% - 30px)",
                background: "#fff",
                border: "1px solid #d5d7d9",
                borderRadius: "3px",
                padding: "28px 34px 32px"
            }}>
                <h1 style={{
                    textAlign: "center",
                    fontSize: "32px",
                    fontWeight: 700,
                    marginBottom: "6px"
                }}>Sign Up</h1>

                <p style={{
                    textAlign: "center",
                    color: "#606162",
                    marginBottom: "24px"
                }}>Create your Sora account</p>

                {error ? <div style={{
                    color: "#d86868",
                    marginBottom: "12px",
                    fontSize: "14px"
                }}>{error}</div> : null}

                <form onSubmit={submit}>
                    <label style={{fontWeight: 600}}>Username</label>
                    <input
                        className="form-control"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        disabled={loading}
                        autoComplete="username"
                        style={{marginTop: "5px", marginBottom: "14px"}}
                    />

                    <label style={{fontWeight: 600}}>Password</label>
                    <input
                        className="form-control"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="new-password"
                        style={{marginTop: "5px", marginBottom: "14px"}}
                    />

                    <label style={{fontWeight: 600}}>Confirm Password</label>
                    <input
                        className="form-control"
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        disabled={loading}
                        autoComplete="new-password"
                        style={{marginTop: "5px", marginBottom: "20px"}}
                    />

                    <button
                        className="btn btn-success w-100"
                        type="submit"
                        disabled={loading || !username || !password}
                        style={{fontWeight: 600}}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div style={{
                    textAlign: "center",
                    marginTop: "18px",
                    color: "#606162"
                }}>
                    Already have an account? <a href="/login">Log In</a>
                </div>
            </div>
        </div>
    </>;
};

export default SignupPage;
