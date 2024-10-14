export interface ValidationErrors {
  email?: string;
  password?: string;
}

export const validateLoginForm = (
  email: string,
  password: string
): ValidationErrors => {
  const errors: ValidationErrors = {};
  // const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate email
  // if (!emailPattern.test(email)) {
  if (email === "") {
    errors.email = "Please type your email.";
  }

  // Validate password
  if (password === "") {
    errors.password = "Please type your password.";
  }

  return errors;
};
