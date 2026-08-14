import { useState } from "react";
import { login } from "../../../services/auth";

const LoginArea = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login({ username, password });
            window.location.href = "/home";
        } catch (requestError) {
            setError(
                requestError?.response?.data?.errors?.[0]?.message ||
                requestError?.message ||
                "Unable to log in."
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
                }}>Log In</h1>

                <p style={{
                    textAlign: "center",
                    color: "#606162",
                    marginBottom: "24px"
                }}>Log in to your Sora account</p>

                {error ? <div role="alert" style={{
                    color: "#d86868",
                    marginBottom: "12px",
                    fontSize: "14px"
                }}>{error}</div> : null}

                <form onSubmit={submit}>
                    <label style={{ fontWeight: 600 }}>Username</label>
                    <input
                        className="form-control"
                        value={username}
                        onChange={event => setUsername(event.target.value)}
                        disabled={loading}
                        autoComplete="username"
                        required
                        style={{ marginTop: "5px", marginBottom: "14px" }}
                    />

                    <label style={{ fontWeight: 600 }}>Password</label>
                    <input
                        className="form-control"
                        type="password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        disabled={loading}
                        autoComplete="current-password"
                        required
                        style={{ marginTop: "5px", marginBottom: "20px" }}
                    />

                    <button
                        className="btn btn-success w-100"
                        type="submit"
                        disabled={loading || !username || !password}
                        style={{ fontWeight: 600 }}
                    >
                        {loading ? "Logging In..." : "Log In"}
                    </button>
                </form>

                <div style={{
                    textAlign: "center",
                    marginTop: "18px",
                    color: "#606162"
                }}>
                    New to Sora? <a href="/signup">Create an account</a>
                </div>
            </div>
        </div>
    </>;
};

export default LoginArea;
