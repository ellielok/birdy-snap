import axios from "axios";

const CLIENT_ID = "2hs29ad20nu2cv5da3fp47br7l";
const CLIENT_SECRET = "1clei15onlsp555c0k1n85q42bofio53cjr8823spmhkbusf3fos";
const REDIRECT_URI = window.location.origin;
const COGNITO_DOMAIN =
  "ap-southeast-29veisch4m.auth.ap-southeast-2.amazoncognito.com";

function getBasicAuthHeader() {
  const base64 = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  return `Basic ${base64}`;
}

export async function exchangeCodeForToken(code) {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);

  /* 
    const res = await axios.post(
        `https://${COGNITO_DOMAIN}/oauth2/token`,
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': getBasicAuthHeader()
            }
        }
    )
       
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('id_token', res.data.id_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)

    return res.data
    */

  try {
    const res = await axios.post(
      `https://${COGNITO_DOMAIN}/oauth2/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": getBasicAuthHeader(),
        },
      }
    );
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("id_token", res.data.id_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);

    return res.data;
  } catch (error) {
    if (error.response) {
      console.log("Cognito error:", error.response.data);
      alert(JSON.stringify(error.response.data));
    } else {
      alert(error);
    }
    throw error;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem("id_token");
}

export function makeCognitoLoginUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    scope: "openid email phone profile",
    redirect_uri: window.location.origin,
  });

  return `https://${COGNITO_DOMAIN}/login?${params.toString()}`;
}

export function makeCognitoLogoutUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    logout_uri: window.location.origin,
  });

  return `https://${COGNITO_DOMAIN}/logout?${params.toString()}`;
}

export function parseJwt(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    return null;
  }
}
