# Frontend — Diabetes Risk App

App en React Native (Expo SDK 57) para el proyecto de estimación de riesgo
de diabetes. Ver [`../docs/api.md`](../docs/api.md) para el contrato de la
API que consume, y [`../docs/proyecto.md`](../docs/proyecto.md) para el
contexto general del proyecto.

## Stack

- **Expo SDK 57** + TypeScript + `expo-router` (file-based routing).
- **NativeWind** (Tailwind) para los estilos.
- **`@supabase/supabase-js`** directo desde el cliente para auth (login/signup
  simples con email + contraseña — sin Google, sin verificación de correo).
- **Context + `useReducer`** para sesión y borrador del check-in, sin
  librerías de estado adicionales.
- **AsyncStorage** para retomar un check-in a medio llenar si se cierra la app.

## Quickstart

```bash
cp .env.example .env   # completar EXPO_PUBLIC_SUPABASE_ANON_KEY y EXPO_PUBLIC_API_URL
npm install
npx expo start
```

- Escanea el QR con **Expo Go** (celular y compu en la misma red WiFi).
- `EXPO_PUBLIC_API_URL` debe apuntar a la IP de tu máquina en la red (no
  `localhost`) si vas a probar en un dispositivo físico.
- En Supabase, desactiva "Confirm email" (Authentication → Providers →
  Email) para que el signup funcione sin verificación, como corresponde al MVP.
- Para probar en navegador (`npx expo start` → `w`), el backend necesita CORS
  habilitado (ya está, ver `backend/app/main.py`).

## Estructura

```
src/
├── app/                       # rutas (expo-router)
│   ├── (auth)/                 login, signup
│   ├── (onboarding)/           perfil en 3 fases (una vez, o para editar)
│   ├── (app)/                  tabs: Inicio / Historial / Perfil
│   │   └── historial/          lista + detalle (ver/editar/eliminar un check-in)
│   └── (checkin)/               check-in en 4 fases + resumen + resultado
├── components/ui/              Button, Card, Input, Stepper, OptionChips, DateField, Badge...
├── context/                    auth-context, onboarding-context, checkin-context
├── lib/                        supabase.ts, api.ts, theme.ts, assessment-fields.ts
└── types/                      tipos que reflejan los schemas del backend
```

## Decisiones de diseño

- **El formulario es un wizard, no una pantalla larga**: tanto el perfil
  (onboarding) como el check-in diario se completan "por fases" con barra de
  progreso, para no abrumar al usuario con ~40 campos de una vez.
- **Steppers en vez de sliders**: botones +/- con bandas de referencia
  (ej. "sedentario / activo / muy activo") en vez de un input numérico en
  blanco o una librería de slider nativo — mismo resultado de UX, sin
  dependencias extra.
- **Historial editable**: cada check-in se puede ver completo, editar (recalcula
  con `PUT /assessments/{id}`, mismo registro) o eliminar.
- **Sin dark mode ni gráfico de tendencia** en este MVP — solo modo claro,
  historial como lista de tarjetas.
- **`DateField`** usa el picker nativo (`@react-native-community/datetimepicker`)
  en iOS/Android y un `<input type="date">` HTML en web (`date-field.web.tsx`),
  porque esa librería no soporta el target web.

## Comandos útiles

```bash
npx tsc --noEmit        # typecheck
npx expo export --platform web   # smoke test de bundling (Metro + NativeWind + rutas)
```
