const API = "http://localhost:5000/api/v1";
const CLIENT_ID = "fletnix-demo";
const CLIENT_SECRET = "demo-secret-change-me";
const REDIRECT_URI = "http://localhost:5500/callback.html";

const out = document.getElementById("out");

document.getElementById("authorize").onclick = async () => {
  const token = document.getElementById("token").value.trim();
  if (!token) {
    out.textContent = "Paste your FletNix JWT first.";
    return;
  }

  const verifier = randomString(64);
  const challenge = await sha256Base64Url(verifier);
  sessionStorage.setItem("pkce_verifier", verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: "demo",
  });

  const res = await fetch(`${API}/oauth/authorize?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const data = await res.json();
  if (!res.ok) {
    out.textContent = JSON.stringify(data, null, 2);
    return;
  }
  window.location.href = data.data.redirectUrl;
};

if (sessionStorage.getItem("pkce_verifier") === null) {
  out.textContent = "Ready. Paste JWT and click authorize.";
}
