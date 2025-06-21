import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Auth.module.css'
import shared from '../../styles/shared.module.css'

interface SignUpFormProps {
  onSwitchToLogin: () => void
}

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { signUp, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      return
    }
    
    setIsLoading(true)
    setIsSuccess(false)
    
    try {
      await signUp(email, password)
      setIsSuccess(true)
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={styles.authContainer}>
        <h2>Check Your Email</h2>
        <div className={styles.successMessage}>
          <p>We've sent a confirmation email to <strong>{email}</strong></p>
          <p>Please check your inbox and click the confirmation link to activate your account.</p>
          <p>If you don't see the email, check your spam folder.</p>
        </div>
        <button 
          type="button" 
          onClick={() => {
            setIsSuccess(false)
            setEmail('')
            setPassword('')
            setConfirmPassword('')
          }}
          className={shared.btnSecondary}
        >
          Back to Sign Up
        </button>
      </div>
    )
  }

  return (
    <div className={styles.authContainer}>
      <h2>Create Account</h2>
      <p className={styles.subtitle}>Join the comedy setlist manager</p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.input}
          />
          {password && confirmPassword && password !== confirmPassword && (
            <div className={styles.error}>Passwords don't match</div>
          )}
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <button 
          type="submit" 
          disabled={isLoading || password !== confirmPassword}
          className={shared.btnPrimary}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className={styles.switch}>
        <p>
          Already have an account?{' '}
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            className={styles.linkButton}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
} 