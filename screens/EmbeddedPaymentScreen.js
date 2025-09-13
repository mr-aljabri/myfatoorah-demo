import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { 
  MFSDK, 
  MFCountry, 
  MFEnvironment, 
  MFInitiateSessionRequest, 
  MFCurrencyISO, 
  MFLanguage 
} from 'myfatoorah-reactnative';

export default function EmbeddedPaymentScreen({ navigation }) {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  const API_KEY = 'rLtt6JWvbUHDDhsZnfpAhpYk4dxYDQkbcPTyGaKp2TYqQgG7FGZ5Th_WD53Oq8Ebz6A53njUoo1w3pjU1D4vs_ZMqFiz_j0urb_BH9Oq9VZoKFoJEDAbRZepGcQanImyYrry7Kt6MnMdgfG5jn4HngWoRdKduNNyP4kzcp3mRv7x00ahkm9LAK7ZRieg7k1PDAnBIOG3EyVSJ5kK4WLMvYr7sCwHbHcu4A5WwelxYK0GMJy37bNAarSJDFQsJ2ZvJjvMDmfWwDVFEVe_5tOomfVNt6bOg9mexbGjMrnHBnKnZR1vQbBtQieDlQepzTZMuQrSuKn-t5XZM7V6fCW7oP-uXGX-sMOajeX65JOf6XVpk29DP6ro8WTAflCDANC193yof8-f5_EYY-3hXhJj7RBXmizDpneEQDSaSz5sFk0sV5qPcARJ9zGG73vuGFyenjPPmtDtXtpx35A-BVcOSBYVIWe9kndG3nclfefjKEuZ3m4jL9Gg1h2JBvmXSMYiZtp9MR5I6pvbvylU_PP5xJFSjVTIz7IQSjcVGO41npnwIxRXNRxFOdIUHn0tjQ-7LwvEcTXyPsHXcMD8WtgBh-wxR8aKX7WPSsT1O8d8reb2aR7K3rkV3K82K_0OgawImEpwSvp9MNKynEAJQS6ZHe_J_l77652xwPNxMRTMASk1ZsJL';

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      console.log('🔧 Initializing MyFatoorah SDK for Embedded Payment...');
      
      await MFSDK.init(
        API_KEY,
        MFCountry.SAUDIARABIA,
        MFEnvironment.TEST
      );
      console.log('✅ SDK initialized for embedded payment');
    } catch (error) {
      console.error('❌ Failed to initialize SDK for embedded payment:', error);
      Alert.alert('Initialization Error', 'Failed to initialize MyFatoorah SDK');
    }
  };

  const initiateSession = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting embedded session initiation...');

      const initiateSessionRequest = new MFInitiateSessionRequest(15, MFCurrencyISO.SAUDIARABIA_SAR);
      
      const result = await MFSDK.initiateSession(initiateSessionRequest, MFLanguage.ENGLISH);
      console.log('💳 Session initiated successfully:', JSON.stringify(result, null, 2));
      
      if (!result || !result.SessionId) {
        throw new Error('Invalid session data received - missing SessionId');
      }
      
      console.log('🔑 Session ID:', result.SessionId);
      console.log('🏳️ Country Code:', result.CountryCode);
      
      setSessionData(result);
      setShowWebView(true);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Failed to initiate session:', error);
      Alert.alert('Session Error', `Failed to initiate embedded session: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  const generateEmbeddedHTML = () => {
    if (!sessionData) return '';

    // Generate HTML with embedded MyFatoorah integration
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>MyFatoorah Embedded Payment</title>
        <style>
            body {
                margin: 0;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .title {
                color: #34C759;
                font-size: 24px;
                font-weight: bold;
                margin: 0;
            }
            .amount {
                color: #666;
                font-size: 18px;
                margin: 5px 0;
            }
            #embedded-payment {
                min-height: 400px;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 10px;
                background: #fafafa;
            }
            .status {
                text-align: center;
                padding: 20px;
                color: #666;
            }
        </style>
        <script src="https://demo.myfatoorah.com/payment/v1/session.js"></script>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">MyFatoorah Embedded Payment</h1>
                <p class="amount">Amount: 15.00 SAR</p>
            </div>
            
            <div id="embedded-payment">
            </div>
        </div>

        <script>
            console.log('🔧 Initializing MyFatoorah embedded payment...');
            console.log('📄 SessionId:', '${sessionData.SessionId || 'MISSING'}');
            console.log('🌍 Country:', '${sessionData.CountryCode || 'MISSING'}');
            
            // Payment callback function (following official docs)
            function payment(response) {
                console.log('💳 Payment response received:', response);
                
                if (response.isSuccess) {
                    console.log('✅ Payment successful');
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'payment_success',
                        data: response
                    }));
                } else {
                    console.log('❌ Payment failed');
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'payment_error',
                        data: response
                    }));
                }
            }

            // Apple Pay session callbacks
            function handleSessionStart() {
                console.log('🍎 Apple Pay session started');
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'applepay_started',
                    message: 'Apple Pay payment session started'
                }));
            }

            function handleSessionCancel() {
                console.log('❌ Apple Pay session cancelled');
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'applepay_cancelled',
                    message: 'Apple Pay payment was cancelled'
                }));
            }

            // Configuration following official MyFatoorah docs
            var config = {
                sessionId: '${sessionData.SessionId || ''}',
                countryCode: '${sessionData.CountryCode || 'SA'}',
                currencyCode: '${sessionData.CountryCode === 'KWT' ? 'KWD' : 'SAR'}',
                amount: 15.00,
                callback: payment,
                containerId: 'embedded-payment',
                paymentOptions: ['ApplePay'],
                style: {
                    direction: 'ltr',
                    theme: 'light'
                },
                settings: {
                    applePay: {
                        style: {
                            button: {
                                type: "buy",
                                borderRadius: "8px"
                            }
                        },
                        supportedNetworks: ["visa", "masterCard", "amex"],
                        requiredBillingContactFields: ["postalAddress", "name"],
                        sessionStarted: handleSessionStart,
                        sessionCanceled: handleSessionCancel
                    }
                }
            };

            // Initialize payment interface
            function initPayment() {
                try {
                    console.log('🚀 Checking available objects...');
                    console.log('typeof myfatoorah:', typeof myfatoorah);
                    console.log('typeof window.myFatoorah:', typeof window.myFatoorah);
                    console.log('window object keys containing "fat":', Object.keys(window).filter(k => k.toLowerCase().includes('fat')));
                    
                    console.log('🔧 Initializing with config:', config);
                    
                    // Update the loading message first
                    document.getElementById('embedded-payment').innerHTML = 
                        '<div class="status">🔄 Connecting to payment gateway...</div>';
                    
                    var initialized = false;
                    
                    if (typeof myfatoorah !== 'undefined' && myfatoorah.init) {
                        console.log('✅ Using myfatoorah.init');
                        myfatoorah.init(config);
                        initialized = true;
                    } else if (typeof window.myFatoorah !== 'undefined' && window.myFatoorah.init) {
                        console.log('✅ Using window.myFatoorah.init');
                        window.myFatoorah.init(config);
                        initialized = true;
                    } else if (typeof window.myfatoorah !== 'undefined' && window.myfatoorah.init) {
                        console.log('✅ Using window.myfatoorah.init (lowercase)');
                        window.myfatoorah.init(config);
                        initialized = true;
                    } else {
                        console.error('❌ No MyFatoorah library found');
                        console.log('Available window properties:', Object.keys(window).slice(0, 50));
                        throw new Error('MyFatoorah library not found');
                    }
                    
                    if (initialized) {
                        console.log('✅ Payment interface initialization called');
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'interface_loaded',
                            message: 'Payment interface initialized successfully'
                        }));
                        
                        // Allow interface to load without interference
                    }
                    
                } catch (error) {
                    console.error('❌ Initialization failed:', error);
                    document.getElementById('embedded-payment').innerHTML = 
                        '<div class="status">' +
                        '<p>❌ Failed to load payment interface</p>' +
                        '<p>Error: ' + error.message + '</p>' +
                        '<button onclick="retryPayment()" style="padding:10px;margin:5px;background:#FF3B30;color:white;border:none;border-radius:5px;">🔄 Retry</button>' +
                        '</div>';
                        
                    window.retryPayment = function() {
                        console.log('🔄 Retry after error...');
                        setTimeout(initPayment, 500);
                    };
                }
            }

            // Single initialization attempt
            setTimeout(initPayment, 1000);
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('📨 WebView message received:', message);

      switch (message.type) {
        case 'payment_success':
          console.log('✅ Payment completed successfully:', message.data);
          Alert.alert(
            'Payment Success', 
            `Payment completed successfully!\n\nTransaction Details:\n${JSON.stringify(message.data, null, 2)}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setShowWebView(false);
                  setSessionData(null);
                }
              }
            ]
          );
          break;

        case 'payment_error':
          console.error('❌ Payment error:', message.data);
          Alert.alert(
            'Payment Failed', 
            `Payment failed. Please try again.\n\nError Details:\n${JSON.stringify(message.data, null, 2)}`,
            [
              {
                text: 'Retry',
                onPress: () => {
                  setShowWebView(false);
                  setTimeout(() => setShowWebView(true), 500);
                }
              },
              {
                text: 'Cancel',
                onPress: () => {
                  setShowWebView(false);
                  setSessionData(null);
                }
              }
            ]
          );
          break;

        case 'interface_loaded':
          console.log('✅ Payment interface loaded:', message.message || 'Successfully');
          break;

        case 'applepay_started':
          console.log('🍎 Apple Pay session started');
          break;

        case 'applepay_cancelled':
          console.log('❌ Apple Pay cancelled');
          Alert.alert('Apple Pay Cancelled', 'Apple Pay payment was cancelled by user');
          break;

        // Keep legacy handlers for compatibility
        case 'payment_callback':
          console.log('✅ Payment completed (legacy):', message.data);
          Alert.alert('Payment Success', `Payment completed successfully!\nSession: ${message.data.sessionId}`);
          break;

        case 'debug_log':
          console.log('🐞 WebView Debug:', message.message);
          break;

        default:
          console.log('📋 Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (showWebView && sessionData) {
    return (
      <View style={styles.webViewContainer}>
        <View style={styles.webViewHeader}>
          <Button
            title="← Back"
            onPress={() => {
              setShowWebView(false);
              setSessionData(null);
            }}
            color="#666"
          />
          <Text style={styles.webViewTitle}>Embedded Payment</Text>
        </View>
        
        <WebView
          style={styles.webView}
          source={{ html: generateEmbeddedHTML() }}
          onMessage={handleWebViewMessage}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('🚨 WebView error:', nativeEvent);
            Alert.alert('WebView Error', `Failed to load payment interface: ${nativeEvent.description}`);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('🚨 WebView HTTP error:', nativeEvent);
            Alert.alert('HTTP Error', `HTTP ${nativeEvent.statusCode}: ${nativeEvent.description}`);
          }}
          onLoadStart={() => {
            console.log('🔄 WebView started loading...');
          }}
          onLoadEnd={() => {
            console.log('✅ WebView finished loading');
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#34C759" />
              <Text style={styles.loadingText}>Loading Payment Interface...</Text>
            </View>
          )}
        />
        
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Embedded Payment</Text>
      <Text style={styles.subtitle}>MyFatoorah Embedded Integration</Text>
      
      <Text style={styles.description}>
        This embedded payment integration allows users to enter their payment details directly within your app using MyFatoorah's secure embedded interface.
        {'\n\n'}
        Features:
        • Card payments with 3D Secure
        • Apple Pay integration
        • Google Pay support  
        • STC Pay option
        • PCI DSS compliant
      </Text>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Payment Amount:</Text>
        <Text style={styles.amountValue}>15.00 SAR</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Initializing..." : "💳 Start Embedded Payment"}
          onPress={initiateSession}
          color="#34C759"
          disabled={loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>Initiating payment session...</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="← Back to Home"
          onPress={() => navigation.goBack()}
          color="#666"
        />
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#34C759',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  placeholderBox: {
    width: '90%',
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 10,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34C759',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  amountContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    width: '90%',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
});