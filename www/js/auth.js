/**
 * 登入並建立驗證金鑰
 */
export async function login(email, password, server_url) {
  try {
    const response = await fetch(`https://${server_url}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    // 登入失敗
    if (data.status != "success") {
      return {
        success: false,
        reason: data.content
      };
    }

    // 登入成功
    return {
      success: true,
      loginKey: data.loginKey
    };

  } catch (err) {
    console.error("login error:", err);

    return {
      success: false,
      reason: "network error"
    };
  }
}

export async function getLoginStatus(loginKey, server_url){
  const response = await fetch(`https://${server_url}/api/auth/getLoginStatus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${loginKey}`
    }
  });

  if (data.status != "success") {
    return {
      success: false,
      reason: data.content
    };
  }
  return {
    success: true,
    content: data.content
  };
}

export default {login, getLoginStatus};