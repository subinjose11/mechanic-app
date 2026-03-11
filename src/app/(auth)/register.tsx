import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input, GlassCard } from '@presentation/components/common';
import { useAuth } from '@presentation/viewmodels/useAuth';
import { colors } from '@theme/colors';
import { isValidEmail, isStrongPassword } from '@core/utils/validators';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else {
      const passwordCheck = isStrongPassword(password);
      if (!passwordCheck.valid) {
        errors.password = passwordCheck.message;
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.replace('/(auth)/shop-setup');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#12103a', '#08080c']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Orb glow effect */}
      <View style={styles.orb} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.logo}
              >
                <Text style={styles.logoIcon}>🔧</Text>
              </LinearGradient>
            </View>

            {/* App name */}
            <Text style={styles.appName}>
              Mechanic<Text style={styles.appNameAccent}>Pro</Text>
            </Text>
            <Text style={styles.tagline}>WORKSHOP MANAGEMENT</Text>

            {/* Register card */}
            <GlassCard style={styles.card} level="elevated" glow>
              <Text style={styles.cardTitle}>Create Account</Text>
              <Text style={styles.cardSubtitle}>Sign up to get started</Text>

              <Input
                label="Full Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (validationErrors.name) {
                    setValidationErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="Enter your full name"
                autoCapitalize="words"
                error={validationErrors.name}
              />

              <View style={styles.inputSpacing} />

              <Input
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={validationErrors.email}
              />

              <View style={styles.inputSpacing} />

              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationErrors.password) {
                    setValidationErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="Create a password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={validationErrors.password}
                right={
                  <IconButton
                    icon={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    iconColor={colors.textDisabled}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <View style={styles.inputSpacing} />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (validationErrors.confirmPassword) {
                    setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                placeholder="Confirm your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={validationErrors.confirmPassword}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                onPress={handleRegister}
                loading={isLoading}
                fullWidth
                style={styles.button}
              >
                Create Account
              </Button>
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Text style={styles.link}>Sign In</Text>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orb: {
    position: 'absolute',
    top: -80,
    left: '50%',
    marginLeft: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appNameAccent: {
    color: colors.primary,
  },
  tagline: {
    fontSize: 12,
    color: colors.textDisabled,
    letterSpacing: 2.5,
    marginTop: 8,
    marginBottom: 36,
  },
  card: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 22,
  },
  inputSpacing: {
    height: 10,
  },
  errorContainer: {
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    padding: 12,
    borderRadius: 11,
    marginTop: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: colors.textDisabled,
    fontSize: 12,
  },
  link: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
