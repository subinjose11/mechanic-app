import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { observer } from 'mobx-react-lite';
import { Button, Input, GlassCard } from '@presentation/components/common';
import { useAuthStore } from '@views/hooks/useStore';
import { colors } from '@theme/colors';
import { isValidEmail } from '@core/utils/validators';

function LoginScreen() {
  const authStore = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailLogin = async () => {
    authStore.clearError();
    if (!validate()) return;

    try {
      await authStore.login(email.trim(), password);
      router.replace('/');
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleGoogleSignIn = async () => {
    authStore.clearError();
    try {
      await authStore.signInWithGoogle();
      if (authStore.needsShopSetup) {
        router.replace('/(auth)/shop-setup');
      } else {
        router.replace('/(main)/home');
      }
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Background gradient */}
      <LinearGradient
        colors={['#12103a', '#06060A']}
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
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#6366F1', '#A855F7']}
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

            {/* Login card */}
            <GlassCard style={styles.card} level="elevated" glow>
              <Text style={styles.cardTitle}>Welcome</Text>
              <Text style={styles.cardSubtitle}>Sign in to manage your workshop</Text>

              {/* Google Sign-In Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={authStore.isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>
                  {authStore.isLoading ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>

              {authStore.error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{authStore.error}</Text>
                </View>
              )}

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Email Login Toggle */}
              {!showEmailLogin ? (
                <TouchableOpacity
                  style={styles.emailToggle}
                  onPress={() => setShowEmailLogin(true)}
                >
                  <Icon source="email-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.emailToggleText}>Sign in with Email</Text>
                </TouchableOpacity>
              ) : (
                <>
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
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    error={validationErrors.password}
                    rightIcon={showPassword ? 'eye-off' : 'eye'}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                  />

                  <Button
                    onPress={handleEmailLogin}
                    loading={authStore.isLoading}
                    fullWidth
                    style={styles.button}
                  >
                    Sign In
                  </Button>

                  <TouchableOpacity
                    style={styles.backToGoogle}
                    onPress={() => setShowEmailLogin(false)}
                  >
                    <Text style={styles.backToGoogleText}>Back to Google Sign-In</Text>
                  </TouchableOpacity>
                </>
              )}
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Text style={styles.link}>Sign Up</Text>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export default observer(LoginScreen);

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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appNameAccent: {
    color: colors.primary,
  },
  tagline: {
    fontSize: 12,
    color: colors.textTertiary,
    letterSpacing: 2.5,
    marginTop: 8,
    marginBottom: 36,
  },
  card: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 0.5,
    backgroundColor: colors.separator,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: colors.textTertiary,
  },
  emailToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  emailToggleText: {
    marginLeft: 8,
    fontSize: 15,
    color: colors.textSecondary,
  },
  inputSpacing: {
    height: 12,
  },
  errorContainer: {
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
  backToGoogle: {
    alignItems: 'center',
    marginTop: 12,
  },
  backToGoogleText: {
    color: colors.primary,
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  link: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
