import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyFatoorah Payment SDK</Text>
      <Text style={styles.subtitle}>Choose Payment Integration Type</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="🌐 Payment Gateway"
          onPress={() => navigation.navigate('PaymentGateway')}
          color="#007AFF"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="💳 Embedded Payment"
          onPress={() => navigation.navigate('EmbeddedPayment')}
          color="#34C759"
        />
      </View>

      <Text style={styles.description}>
        Payment Gateway: Redirect users to MyFatoorah's hosted payment page
        {'\n\n'}
        Embedded Payment: Integrate payment forms directly in your app
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 15,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 20,
  },
});