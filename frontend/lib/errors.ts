const MAP: Record<string, string> = {
  'Invalid credentials': 'Usuario o contraseña incorrectos',
  'Username already taken': 'El nombre de usuario ya está en uso',
  'Password must be at least 8 characters long': 'La contraseña debe tener al menos 8 caracteres',
  'Password must be at most 128 characters long': 'La contraseña no puede superar los 128 caracteres',
  'Password must contain an uppercase letter, a lowercase letter, and a digit':
    'La contraseña debe contener mayúscula, minúscula y un número',
  'User not found': 'Usuario no encontrado',
  'Cannot delete the admin account': 'No se puede eliminar la cuenta del administrador',
  'Cannot clear the admin password': 'No se puede limpiar la contraseña del administrador',
  'must not be blank': 'El campo no puede estar vacío',
  'Validation failed': 'Error de validación',
};

export function translateError(msg: string): string {
  if (!msg) return 'Ocurrió un error inesperado';
  return MAP[msg] ?? msg;
}
