# 🔧 Configuración Backend Laravel - Teatro de Aventura

## 🚨 Problemas Identificados

Los errores CORS indican que el backend Laravel necesita configuración adicional:

1. **CORS mal configurado** - No permite `withCredentials`
2. **Rutas CSRF inexistentes** - Laravel Sanctum no instalado
3. **Headers incorrectos** - Respuesta con wildcard `*` en lugar de origen específico

## ✅ Soluciones Recomendadas

### **1. Configurar CORS Correctamente**

#### En `config/cors.php`:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'], // Cambiar de '*' a origen específico
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Importante para withCredentials
];
```

### **2. Configurar Middleware de API**

#### En `app/Http/Kernel.php`:

```php
protected $middlewareGroups = [
    'api' => [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];
```

### **3. Excluir API de Verificación CSRF**

#### En `app/Http/Middleware/VerifyCsrfToken.php`:

```php
protected $except = [
    'api/*', // Excluir todas las rutas API
];
```

### **4. Rutas de API Recomendadas**

#### En `routes/api.php`:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rutas sin autenticación
Route::post('/login', [AuthController::class, 'login']);

// Rutas con autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/user/{user}/roles', [AuthController::class, 'getUserRoles']);
    Route::get('/admin-dashboard', [DashboardController::class, 'admin']);
    Route::get('/producer-dashboard', [DashboardController::class, 'producer']);
    Route::get('/director-dashboard', [DashboardController::class, 'director']);
    Route::get('/my-history', [DashboardController::class, 'history']);
});
```

### **5. Controlador de Ejemplo**

#### `app/Http/Controllers/AuthController.php`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ]);
        }

        return response()->json(['message' => 'Credenciales inválidas'], 401);
    }

    public function getUserRoles(User $user)
    {
        return response()->json([
            'user' => $user->name,
            'roles' => ['administrador'], // Temporal
            'permissions' => ['gestionar-usuarios', 'administrar-sistema']
        ]);
    }
}
```

## 🚀 Comandos de Instalación Laravel

Si el proyecto no tiene Laravel Sanctum:

```bash
# Instalar Sanctum
composer require laravel/sanctum

# Publicar configuración
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Ejecutar migraciones
php artisan migrate

# Instalar CORS (si no está)
composer require fruitcake/laravel-cors
```

## 🔧 Verificar Configuración

### **1. Variables de Entorno (.env):**

```env
APP_URL=http://localhost:8008
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

### **2. Configurar Sanctum (`config/sanctum.php`):**

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1')),
```

## ⚡ Solución Rápida (Sin CSRF)

Si quieres probar rápidamente sin configurar CSRF:

#### En el frontend (`src/lib/api.ts`):

```typescript
// Ya está implementado - sin withCredentials ni CSRF
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // withCredentials: false (por defecto)
});
```

#### En el backend, simplemente asegúrate de que:

```php
// config/cors.php
'allowed_origins' => ['http://localhost:3000'],
'supports_credentials' => false, // O true si planeas usar cookies
```

## 🧪 Probar la Conexión

1. Inicia el backend Laravel: `php artisan serve --port=8008`
2. Inicia el frontend: `pnpm dev`
3. Ve a: `http://localhost:3000/test-connection`
4. Ejecuta las pruebas de conectividad

## 📋 Checklist de Verificación

- [ ] Backend ejecutándose en puerto 8008
- [ ] CORS configurado para localhost:3000
- [ ] Rutas API definidas correctamente
- [ ] Usuario de prueba creado (admin@teatro.local)
- [ ] Middleware de autenticación configurado
- [ ] Sin errores en logs de Laravel

Con estas configuraciones, el error CORS debería resolverse y el login debería funcionar correctamente.
