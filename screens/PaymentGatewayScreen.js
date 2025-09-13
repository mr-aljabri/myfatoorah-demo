import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  MFSDK, 
  MFCountry, 
  MFEnvironment, 
  MFInitiatePaymentRequest, 
  MFExecutePaymentRequest, 
  MFCurrencyISO, 
  MFLanguage 
} from 'myfatoorah-reactnative';

export default function PaymentGatewayScreen({ navigation }) {
  const API_KEY = 'rLtt6JWvbUHDDhsZnfpAhpYk4dxYDQkbcPTyGaKp2TYqQgG7FGZ5Th_WD53Oq8Ebz6A53njUoo1w3pjU1D4vs_ZMqFiz_j0urb_BH9Oq9VZoKFoJEDAbRZepGcQanImyYrry7Kt6MnMdgfG5jn4HngWoRdKduNNyP4kzcp3mRv7x00ahkm9LAK7ZRieg7k1PDAnBIOG3EyVSJ5kK4WLMvYr7sCwHbHcu4A5WwelxYK0GMJy37bNAarSJDFQsJ2ZvJjvMDmfWwDVFEVe_5tOomfVNt6bOg9mexbGjMrnHBnKnZR1vQbBtQieDlQepzTZMuQrSuKn-t5XZM7V6fCW7oP-uXGX-sMOajeX65JOf6XVpk29DP6ro8WTAflCDANC193yof8-f5_EYY-3hXhJj7RBXmizDpneEQDSaSz5sFk0sV5qPcARJ9zGG73vuGFyenjPPmtDtXtpx35A-BVcOSBYVIWe9kndG3nclfefjKEuZ3m4jL9Gg1h2JBvmXSMYiZtp9MR5I6pvbvylU_PP5xJFSjVTIz7IQSjcVGO41npnwIxRXNRxFOdIUHn0tjQ-7LwvEcTXyPsHXcMD8WtgBh-wxR8aKX7WPSsT1O8d8reb2aR7K3rkV3K82K_0OgawImEpwSvp9MNKynEAJQS6ZHe_J_l77652xwPNxMRTMASk1ZsJL';

  useEffect(() => {
    initializeSDK();
  }, []);

  const debugTokenInfo = () => {
    console.log('=== API TOKEN DEBUG INFO ===');
    console.log('Token length:', API_KEY.length);
    console.log('Token starts with:', API_KEY.substring(0, 10));
    console.log('Token ends with:', API_KEY.substring(API_KEY.length - 10));
    console.log('Token contains special chars:', /[^a-zA-Z0-9_-]/.test(API_KEY));
    console.log('================================');
  };

  const initializeSDK = async () => {
    try {
      debugTokenInfo();
      
      console.log('🚀 Initializing MyFatoorah SDK...');
      console.log('🌍 Country: SAUDI ARABIA');
      console.log('🧪 Environment: TEST');
      console.log('💰 Expected Currency: SAR');
      
      await MFSDK.init(
        API_KEY,
        MFCountry.SAUDIARABIA,
        MFEnvironment.TEST
      );
      console.log('✅ MyFatoorah SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize MyFatoorah SDK:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Initialization Error', `Failed to initialize SDK: ${error.message || 'Unknown error'}`);
    }
  };

  const testDifferentConfigurations = async () => {
    const configurations = [
      { country: MFCountry.KUWAIT, env: MFEnvironment.TEST, name: 'Kuwait-TEST' },
      { country: MFCountry.SAUDIARABIA, env: MFEnvironment.TEST, name: 'Saudi-TEST' },
      { country: MFCountry.UAE, env: MFEnvironment.TEST, name: 'UAE-TEST' },
    ];

    for (const config of configurations) {
      try {
        console.log(`🔄 Testing ${config.name}...`);
        await MFSDK.init(API_KEY, config.country, config.env);
        console.log(`✅ ${config.name} - SUCCESS`);
        return config;
      } catch (error) {
        console.log(`❌ ${config.name} - FAILED:`, error.message);
      }
    }
    return null;
  };

  const initiatePayment = async () => {
    try {
      console.log('Starting initiate payment...');
      const initiatePaymentRequest = new MFInitiatePaymentRequest(10, MFCurrencyISO.SAUDIARABIA_SAR);
      
      console.log('Initiate payment request created with amount: 10 SAR');
      
      const result = await MFSDK.initiatePayment(initiatePaymentRequest, MFLanguage.ENGLISH);
      console.log('Payment initiated successfully:', JSON.stringify(result, null, 2));
      Alert.alert('Success', `Payment initiated! \nResult: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      
      let errorMessage = 'Failed to initiate payment';
      if (error && error.code === '401') {
        errorMessage = 'Authorization Error: Please check API key and environment configuration';
      } else if (error && error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert('Payment Error', errorMessage);
    }
  };

  const executePaymentWithMethod = async (paymentMethodId, methodName) => {
    try {
      console.log(`💳 Executing payment with ${methodName} (ID: ${paymentMethodId})`);
      
      // Create executePayment request with all required fields
      const executePaymentRequest = new MFExecutePaymentRequest(10);
      
      // ⚠️ CRITICAL: Only set PaymentMethodId in capitalized format
      executePaymentRequest.PaymentMethodId = paymentMethodId;
      
      // Add expiry date (24 hours from now)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      executePaymentRequest.ExpiryDate = expiryDate.toISOString();
      
      console.log('=== EXECUTE PAYMENT DEBUG ===');
      console.log('Request object type:', typeof executePaymentRequest);
      console.log('PaymentMethodId value:', executePaymentRequest.PaymentMethodId);
      console.log('PaymentMethodId type:', typeof executePaymentRequest.PaymentMethodId);
      console.log('==============================');
      
      const result = await MFSDK.executePayment(
        executePaymentRequest, 
        MFLanguage.ENGLISH,
        (invoiceId) => {
          console.log('✅ Payment callback - Invoice ID:', invoiceId);
          Alert.alert('Payment Success', `${methodName} payment completed!\nInvoice ID: ${invoiceId}`);
        }
      );
      console.log(`✅ ${methodName} payment executed successfully:`, result);
      Alert.alert('Success', `${methodName} payment executed successfully!`);
    } catch (error) {
      console.error(`❌ Failed to execute ${methodName} payment:`, error);
      console.error('Error object:', JSON.stringify(error, null, 2));
      console.error('Error stack:', error.stack);
      Alert.alert('Payment Error', `Failed to execute ${methodName} payment: ${error.message || 'Unknown error'}`);
    }
  };

  // Payment method functions
  const executeVisaPayment = () => executePaymentWithMethod(2, 'VISA/MASTER');
  const executeMadaPayment = () => executePaymentWithMethod(6, 'MADA');
  const executeApplePayment = () => executePaymentWithMethod(11, 'Apple Pay');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Gateway</Text>
      <Text style={styles.subtitle}>MyFatoorah Gateway Integration</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="🔧 Test Different Configs"
          onPress={testDifferentConfigurations}
          color="#FF9500"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Initiate Payment"
          onPress={initiatePayment}
          color="#007AFF"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="💳 Pay with VISA/MASTER"
          onPress={executeVisaPayment}
          color="#1A1F71"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="🏦 Pay with MADA"
          onPress={executeMadaPayment}
          color="#00A651"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="🍎 Pay with Apple Pay"
          onPress={executeApplePayment}
          color="#000000"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="← Back to Home"
          onPress={() => navigation.goBack()}
          color="#666"
        />
      </View>
      
      <Text style={styles.note}>
        Using Saudi Arabia TEST environment with SAR currency
      </Text>
      
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 8,
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});