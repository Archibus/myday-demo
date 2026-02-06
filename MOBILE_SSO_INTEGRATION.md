# Mobile App SSO Integration Guide

## Problem
When the mobile app authenticates via MSAL and then loads `https://archibus.github.io/myday-demo/` in the WebView, the user is asked to login again because:
1. Native MSAL tokens are not shared with the WebView
2. `document.location.replace()` replaces the entire page, losing any stored state

## Solution
The web app now exposes a global JavaScript function that the native layer can call to inject tokens **after the page loads**.

---

## Web App Changes (Already Implemented ✅)

### 1. Global function exposed in `index.tsx`
```typescript
window.injectNativeTokens = (tokenData: {
  accessToken: string;
  idToken: string;
  expiresIn?: number;
}) => boolean;
```

### 2. SSOAuth.tsx listens for native token injection
- Detects if running in native WebView
- Waits for tokens to be injected
- Falls back to PKCE login if no tokens received

---

## Mobile App Changes Required

### Android - `IntunePlugin.java`

Add these changes to inject tokens after WebView loads:

```java
// Add instance variable to store tokens
private String pendingAccessToken = null;
private String pendingIdToken = null;

// Add method to inject tokens
private void injectTokensIntoWebView() {
    if (pendingAccessToken == null || pendingIdToken == null) {
        return;
    }
    
    WebView webView = getBridge().getWebView();
    webView.post(() -> {
        String script = String.format(
            "javascript:(function() { " +
            "  if (window.injectNativeTokens) { " +
            "    var result = window.injectNativeTokens({ " +
            "      accessToken: '%s', " +
            "      idToken: '%s', " +
            "      expiresIn: 3600 " +
            "    }); " +
            "    console.log('Token injection result: ' + result); " +
            "  } else { " +
            "    console.log('injectNativeTokens not available yet'); " +
            "  } " +
            "})();",
            pendingAccessToken.replace("'", "\\'"),
            pendingIdToken.replace("'", "\\'")
        );
        webView.evaluateJavascript(script, null);
    });
}

// Update prepareWebViewForSSO to inject tokens on page load
private void prepareWebViewForSSO(Callable callable) {
    WebView webView = getBridge().getWebView();
    webView.post(() -> {
        webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                
                // Inject tokens when the target page loads
                if (url.contains("archibus.github.io/myday-demo")) {
                    // Small delay to ensure React app is initialized
                    new Handler(Looper.getMainLooper()).postDelayed(() -> {
                        injectTokensIntoWebView();
                    }, 500);
                }
            }
        });
        webView.getSettings().setJavaScriptEnabled(true);
        try {
            callable.call();
        } catch (Exception e) {
            e.printStackTrace();
        }
    });
}

// Update AuthCallback.onSuccess to store tokens
@Override
public void onSuccess(final IAuthenticationResult result) {
    // ... existing code ...
    
    // Store tokens for WebView injection
    pendingAccessToken = result.getAccessToken();
    pendingIdToken = result.getAccount().getIdToken();
    
    // ... rest of existing code ...
}
```

### Update `CustomBridgeWebView.java`

```java
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class CustomBridgeWebView extends BridgeWebViewClient {
    private String accessToken;
    private String idToken;
    private String appProxyUrl;

    public CustomBridgeWebView(Bridge bridge, String appProxyUrl) {
        super(bridge);
        this.appProxyUrl = appProxyUrl;
    }

    public void setTokens(String accessToken, String idToken) {
        this.accessToken = accessToken;
        this.idToken = idToken;
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        
        // Inject tokens when target page loads
        if (accessToken != null && idToken != null && 
            (url.contains("archibus.github.io") || url.contains(appProxyUrl))) {
            
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                injectTokens(view);
            }, 500);
        }
    }

    private void injectTokens(WebView view) {
        String script = String.format(
            "javascript:(function() { " +
            "  if (window.injectNativeTokens) { " +
            "    window.injectNativeTokens({ " +
            "      accessToken: '%s', " +
            "      idToken: '%s', " +
            "      expiresIn: 3600 " +
            "    }); " +
            "  } " +
            "})();",
            accessToken.replace("'", "\\'"),
            idToken.replace("'", "\\'")
        );
        view.evaluateJavascript(script, null);
    }
}
```

---

### iOS - Swift Implementation

In your WebView delegate or Capacitor plugin:

```swift
import WebKit

class WebViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!
    var accessToken: String?
    var idToken: String?
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard let url = webView.url?.absoluteString,
              url.contains("archibus.github.io/myday-demo"),
              let accessToken = self.accessToken,
              let idToken = self.idToken else {
            return
        }
        
        // Small delay to ensure React app is initialized
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.injectTokens(accessToken: accessToken, idToken: idToken)
        }
    }
    
    private func injectTokens(accessToken: String, idToken: String) {
        let escapedAccessToken = accessToken.replacingOccurrences(of: "'", with: "\\'")
        let escapedIdToken = idToken.replacingOccurrences(of: "'", with: "\\'")
        
        let script = """
        (function() {
            if (window.injectNativeTokens) {
                var result = window.injectNativeTokens({
                    accessToken: '\(escapedAccessToken)',
                    idToken: '\(escapedIdToken)',
                    expiresIn: 3600
                });
                console.log('Token injection result: ' + result);
            }
        })();
        """
        
        webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("Failed to inject tokens: \(error)")
            } else {
                print("Tokens injected successfully")
            }
        }
    }
}
```

---

## Testing

1. Build and deploy the web app to `https://archibus.github.io/myday-demo/`
2. Update the native Android/iOS code as shown above
3. Run the mobile app
4. After MSAL authentication, the WebView should load and tokens should be injected
5. Check browser console for: `🔐 Tokens injected from native app`
6. User should be automatically authenticated without second login

## Security Notes

- Tokens are passed via JavaScript bridge, NOT in URL (secure)
- Communication happens within the app's WebView context only
- Tokens are stored in localStorage (standard OAuth practice)
- All traffic is over HTTPS

