import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const signup = async () => {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    alert(data.message || "User registered");
  };

  const login = async () => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);

      const dashboardRes = await fetch("http://localhost:5000/dashboard", {
        headers: {
          Authorization: data.token,
        },
      });

      const dashboardData = await dashboardRes.json();
      setUser(dashboardData.user);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // 👇 Dashboard view
  if (user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>🎉 Welcome {user.email}</h1>
        <p>You are logged in!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  // 👇 Login/Signup view
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🚀 DevLaunch</h1>

      <input
        type="email"
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Enter password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={signup}>Signup</button>
      <button onClick={login} style={{ marginLeft: "10px" }}>
        Login
      </button>
    </div>
  );
}

export default App;