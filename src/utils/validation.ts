export const required = (fieldName) => (val) => !!val || `${fieldName} é obrigatório!`;

export const email = (val) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(val) || 'Digite um e-mail válido';
};

//faça o nome de usuário que não pode ter espaços, caracteres especiais e letras maiusculas
export const username = (val) => {
  const pattern = /^[a-z0-9_]+$/;
  return pattern.test(val) || 'Nome de usuário inválido';
};

export const validateEmail = (val) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(val);
};

export const validateSelect = (val) => {
  return typeof val === 'number' && val >= 0;
};

export const minLength = (fieldName, length) => (val) =>
  (val && val.length >= length) || `${fieldName} deve ter pelo menos ${length} caracteres`;

export const passwordMatch = (password, confirmPassword) => () =>
  password === confirmPassword || 'As senhas não coincidem';

export const checkboxRequired = (val) =>
  val === true || 'Você deve aceitar os termos para continuar';
