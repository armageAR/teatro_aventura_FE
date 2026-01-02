import { toast } from 'react-hot-toast';

interface HandleApiErrorOptions {
  isEditing?: boolean;
  entityName?: string; // para decir "crear usuario", "crear compañía", etc.
}

export function handleApiError(
  error: unknown,
  options: HandleApiErrorOptions = {},
) {
  const { isEditing = false, entityName = 'registro' } = options;

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object'
  ) {
    const axiosError = error as {
      response: {
        status: number;
        data?: {
          errors?: Record<string, string[]>;
          message?: string;
        };
      };
      message?: string;
    };

    const status = axiosError.response.status;

    if (status === 422) {
      const validationErrors = axiosError.response.data?.errors;
      if (validationErrors) {
        const firstField = Object.keys(validationErrors)[0];
        const firstError = validationErrors[firstField][0];
        toast.error(`Error de validación: ${firstError}`);
      } else if (axiosError.response.data?.message) {
        toast.error(`Error de validación: ${axiosError.response.data.message}`);
      } else {
        toast.error('Error de validación. Revisa los datos ingresados.');
      }
    } else if (status === 401) {
      toast.error(
        `No tienes permisos para ${
          isEditing ? 'editar' : 'crear'
        } ${entityName}`,
      );
    } else if (status === 403) {
      toast.error('Acceso denegado');
    } else {
      toast.error(
        `Error al ${isEditing ? 'actualizar' : 'crear'} el ${entityName}: ${
          axiosError.response.data?.message || axiosError.message
        }`,
      );
    }
  } else {
    console.error('Error inesperado', error);
    toast.error('Ocurrió un error inesperado. Intenta de nuevo.');
  }
}
