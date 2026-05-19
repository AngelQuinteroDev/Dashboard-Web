# 🎮 Maze Analytics Dashboard

Dashboard web profesional en tiempo real para análisis de comportamiento de jugadores en un juego de laberinto desarrollado en Unity, conectado a Firebase Firestore.

---

## 🚀 Configuración rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase

Crea el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Estructura de datos en Firestore

El dashboard consume dos colecciones de Firestore. Toda la información que ves en pantalla proviene directamente de estos documentos.

### Colección `sessions`

Cada documento representa **una partida jugada**. Unity escribe este documento al finalizar cada sesión.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `sessionId` | string | ID único de la sesión |
| `playerName` | string | Nombre del jugador |
| `finalScore` | number | Puntuación final obtenida |
| `duration` | number | Duración de la sesión en **segundos** |
| `startTime` | Timestamp | Fecha y hora de inicio de la sesión |
| `reachedGoal` | boolean | `true` si el jugador llegó a la meta |
| `collisions` | number | Cantidad de colisiones durante la sesión |
| `wrongTurns` | number | Cantidad de giros incorrectos tomados |
| `pauseCount` | number | Cantidad de veces que el jugador pausó el juego |
| `pathEfficiency` | number | Eficiencia de ruta (valor entre `0.0` y `1.0`) |
| `averageDecisionTime` | number | Tiempo promedio de decisión por movimiento (segundos) |
| `remainingTime` | number | Tiempo restante del temporizador al terminar (segundos) |

### Colección `highscores`

Cada documento representa **el mejor puntaje histórico de un jugador**. El ID del documento es el `playerName`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `playerName` | string | Nombre del jugador |
| `score` | number | Puntaje máximo histórico alcanzado |

---

## 📊 Métricas globales — Cómo se calculan

Estas métricas aparecen en las **12 tarjetas** de la sección **Overview** y se recalculan automáticamente cada vez que llegan datos nuevos desde Firestore.

Todas usan como base el arreglo de sesiones activo (filtrado por rango de fechas si se seleccionó uno).

### 1. Total Sesiones
```
totalSessions = sessions.length
```
Cuenta simple de documentos en la colección `sessions`. Representa cuántas partidas se han jugado en total (o en el período filtrado).

---

### 2. Jugadores Únicos
```
uniquePlayers = new Set(sessions.map(s => s.playerName)).size
```
Extrae todos los `playerName` de las sesiones, los mete en un `Set` (que elimina duplicados) y cuenta cuántos quedan. Mide cuántos jugadores distintos han jugado.

---

### 3. Score Promedio
```
averageScore = round( sum(s.finalScore) / sessions.length )
```
Suma todos los `finalScore` de todas las sesiones y divide entre el total. Se redondea al entero más cercano. Indica el nivel de puntuación típico de una partida.

---

### 4. Score Máximo
```
maxScore = Math.max(...sessions.map(s => s.finalScore))
```
El valor más alto de `finalScore` registrado en todas las sesiones. Representa el récord absoluto dentro del período seleccionado.

---

### 5. Tasa de Éxito
```
successRate = (sessions.filter(s => s.reachedGoal === true).length / sessions.length) * 100
```
Porcentaje de sesiones donde el jugador llegó a la meta. Un 100% significa que todos los jugadores completaron el laberinto; 0% significa que nadie lo logró. Se muestra como porcentaje con un decimal.

---

### 6. Duración Promedio
```
avgDuration = sum(s.duration) / sessions.length
```
Promedio simple de la duración en segundos de todas las sesiones. Se formatea como `M:SS` (minutos:segundos). Indica cuánto tiempo pasan los jugadores en una partida típica.

---

### 7. Total Colisiones
```
totalCollisions = sum(s.collisions)
```
Suma absoluta de todas las colisiones registradas en todas las sesiones. Es un indicador de la dificultad del laberinto y de la torpeza de navegación global.

---

### 8. Total Pausas
```
totalPauses = sum(s.pauseCount)
```
Suma de todos los `pauseCount` de todas las sesiones. Útil para detectar si los jugadores interrumpen frecuentemente la partida.

---

### 9. Tiempo Promedio de Decisión
```
avgDecisionTime = sum(s.averageDecisionTime) / sessions.length
```
Promedio de los promedios de tiempo de decisión de cada sesión (en segundos). Un valor bajo indica que los jugadores toman decisiones rápidamente; un valor alto puede indicar dificultad para orientarse. Se muestra con 3 decimales.

---

### 10. Eficiencia Promedio
```
avgEfficiency = ( sum(s.pathEfficiency) / sessions.length ) * 100
```
El campo `pathEfficiency` de Firestore llega como un valor entre `0.0` y `1.0`. El dashboard lo multiplica por 100 para mostrarlo como porcentaje. El promedio indica qué tan directas son las rutas que toman los jugadores en general. Una eficiencia alta significa que van casi en línea recta hacia la meta; baja significa muchos rodeos.

---

### 11. Promedio de Giros Incorrectos
```
avgWrongTurns = sum(s.wrongTurns) / sessions.length
```
Promedio de la cantidad de giros incorrectos por sesión. Indica el nivel de desorientación típico de los jugadores dentro del laberinto. Se muestra con 1 decimal.

---

### 12. Tiempo Restante Promedio
```
avgRemainingTime = sum(s.remainingTime) / sessions.length
```
Promedio del tiempo que les sobra del temporizador a los jugadores al terminar la sesión (en segundos). Un valor alto indica que los jugadores terminan con tiempo de sobra; cercano a cero indica que se quedan sin tiempo. Solo es significativo en sesiones donde `reachedGoal = true`.

---

## 👤 Métricas por jugador

En la sección **Players**, el dashboard agrupa todas las sesiones por `playerName` y calcula métricas individuales.

```
playerSessions = sessions.filter(s => s.playerName === nombre)
```

| Métrica | Fórmula |
|---------|---------|
| `totalSessions` | `playerSessions.length` |
| `bestScore` | `Math.max(...playerSessions.map(s => s.finalScore))` |
| `avgScore` | `round( sum(finalScore) / total )` |
| `avgDuration` | `sum(duration) / total` |
| `avgCollisions` | `sum(collisions) / total` |
| `avgWrongTurns` | `sum(wrongTurns) / total` |
| `avgEfficiency` | `(sum(pathEfficiency) / total) * 100` |
| `avgDecisionTime` | `sum(averageDecisionTime) / total` |
| `successRate` | `(sesiones con reachedGoal=true / total) * 100` |
| `totalPlaytime` | `sum(duration)` en segundos |

Los jugadores se ordenan por `bestScore` descendente.

---

## 📡 Leaderboard

La colección `highscores` es independiente de `sessions`. Unity actualiza directamente este documento cuando el jugador supera su récord personal. El dashboard:

1. Lee la colección en tiempo real con `onSnapshot`
2. Ordena por `score` descendente (Firestore query)
3. Asigna `rank = index + 1` en el cliente
4. La barra de progreso de cada jugador se calcula como: `(score / maxScore) * 100%`

---

## 📈 Datos de tendencias (Trends)

Para los gráficos de líneas y área en las secciones **Trends** y **Overview**, el dashboard genera un punto de datos por cada día de los últimos 30 días:

```
Para cada día D en los últimos 30 días:
  daySessions = sessions donde format(startTime) === D
  
  avgScore     = sum(finalScore) / daySessions.length
  avgDuration  = sum(duration)   / daySessions.length
  avgEfficiency= (sum(pathEfficiency) / total) * 100
  successRate  = (sesiones con reachedGoal / total) * 100
  sessions     = daySessions.length
```

Si un día no tiene sesiones, todos los valores se reportan como `0`.

---

## 🗺️ Heatmaps — Cómo se construyen

Los mapas de calor muestran patrones de actividad distribuyendo las sesiones por **día de la semana** (0=Dom … 6=Sáb) y **hora del día** (0–23).

### Heatmap de Actividad
```
Para cada sesión:
  día  = startTime.getDay()   // 0-6
  hora = startTime.getHours() // 0-23
  counts[día-hora] += 1

Intensidad del color = counts[día-hora] / max(counts)
```

### Heatmap de Colisiones
```
collisionMap[día-hora] += session.collisions
```
Muestra en qué momentos los jugadores chocan más.

### Heatmap de Score Promedio
```
scoreMap[día-hora].total += session.finalScore
scoreMap[día-hora].count += 1
avgScore = total / count
```
Muestra en qué horarios los jugadores obtienen mejores puntajes.

---

## 🕸️ Radar Chart — Normalización de ejes

El **radar de rendimiento** de cada sesión tiene 6 dimensiones, todas normalizadas a un rango de **0 a 100**:

| Eje | Fórmula de normalización | Interpretación |
|-----|--------------------------|----------------|
| **Score** | `(finalScore / maxScore) * 100` | Relativo al máximo histórico |
| **Efficiency** | `pathEfficiency * 100` | Directo del campo (0.0→1.0 a 0→100%) |
| **Speed** | `((120 - duration) / 120) * 100` | 120s como referencia máxima; más rápido = más alto |
| **Navigation** | `100 - (collisions / (avgCollisions*2)) * 100` | Menos colisiones = puntaje más alto |
| **Decisions** | `100 - (averageDecisionTime / 1.0) * 100` | 1s como referencia máxima; más rápido = más alto |
| **Accuracy** | `100 - (wrongTurns / (avgWrongTurns*2)) * 100` | Menos giros incorrectos = puntaje más alto |

Todos los valores se recortan entre `0` y `100` con `Math.min` / `Math.max`.

---

## 💡 Insights automáticos — Reglas de detección

Al abrir el detalle de una sesión, el dashboard genera insights comparando la sesión con las métricas globales:

| Condición | Tipo | Mensaje |
|-----------|------|---------|
| `finalScore > avgScore * 1.5` | ✅ Positivo | "Outstanding Score" |
| `finalScore < avgScore * 0.5` | ❌ Negativo | "Below Average Score" |
| `collisions > avgCollisions * 1.5` | ⚠️ Advertencia | "High Collision Rate" |
| `collisions < avgCollisions * 0.5` | ✅ Positivo | "Excellent Navigation" |
| `pathEfficiency > avgEfficiency/100 * 1.3` | ✅ Positivo | "High Path Efficiency" |
| `averageDecisionTime < avgDecisionTime * 0.7` | ✅ Positivo | "Fast Decision Making" |
| `averageDecisionTime > avgDecisionTime * 1.5` | ℹ️ Neutral | "Careful Decision Making" |
| `reachedGoal === true` | ✅ Positivo | "Goal Reached" |
| `reachedGoal === false` | ❌ Negativo | "Goal Not Reached" |
| `wrongTurns > avgWrongTurns * 1.5` | ⚠️ Advertencia | "Many Wrong Turns" |

---

## 🎨 Distribuciones (sección Performance)

### Distribución de Scores
Las sesiones se agrupan en 6 rangos fijos y se cuenta cuántas caen en cada uno:

| Rango | Condición |
|-------|-----------|
| 0 – 2K | `0 ≤ finalScore < 2000` |
| 2K – 4K | `2000 ≤ finalScore < 4000` |
| 4K – 6K | `4000 ≤ finalScore < 6000` |
| 6K – 8K | `6000 ≤ finalScore < 8000` |
| 8K – 10K | `8000 ≤ finalScore < 10000` |
| 10K+ | `finalScore ≥ 10000` |

### Distribución de Duraciones
Las sesiones se agrupan en 5 rangos de tiempo:

| Rango | Condición |
|-------|-----------|
| 0 – 15s | `0 ≤ duration < 15` |
| 15 – 30s | `15 ≤ duration < 30` |
| 30 – 60s | `30 ≤ duration < 60` |
| 60 – 90s | `60 ≤ duration < 90` |
| 90 – 120s | `90 ≤ duration < 120` |

---

## 🔧 Filtros disponibles

En la sección **Sessions** se pueden aplicar los siguientes filtros sobre el conjunto de sesiones:

| Filtro | Campo afectado | Lógica |
|--------|---------------|--------|
| Rango de fecha | `startTime` | `isAfter(startTime, now - N días)` |
| Nombre de jugador | `playerName` | `includes()` (búsqueda parcial, case-insensitive) |
| Score mínimo | `finalScore` | `finalScore >= minScore` |
| Score máximo | `finalScore` | `finalScore <= maxScore` |
| Reached Goal | `reachedGoal` | `=== true`, `=== false`, o sin filtro |
| Duración mínima | `duration` | `duration >= minDuration` |
| Eficiencia mínima | `pathEfficiency` | `pathEfficiency * 100 >= minEfficiency` |

El filtro de **rango de fechas** del header también aplica globalmente a todas las secciones.

---

## 🏗️ Arquitectura del código

```
src/
├── firebase/
│   ├── config.ts          # Inicialización Firebase (singleton)
│   └── services.ts        # onSnapshot listeners + queries Firestore
├── hooks/
│   └── useFirebase.ts     # Custom hooks: useSessions, useHighscores,
│                          # useGlobalMetrics, usePlayerMetrics, useTrends...
├── utils/
│   └── metrics.ts         # Todas las funciones de cálculo documentadas aquí
├── types/
│   └── index.ts           # Interfaces TypeScript de todos los modelos
├── components/
│   ├── Dashboard.tsx      # Orquestador principal
│   ├── sections/          # 9 vistas del dashboard
│   └── ...
└── charts/                # 8 componentes Recharts
```

### Flujo de datos
```
Firestore (onSnapshot)
    ↓ tiempo real
useSessions() / useHighscores()   ← hooks con useState + useEffect
    ↓
calculateGlobalMetrics(sessions)  ← utils/metrics.ts
calculatePlayerMetrics(sessions)
calculateTrends(sessions, 30)
calculateHeatmap(sessions)
    ↓
Componentes React                 ← re-render automático al llegar datos nuevos
```

---

## 📦 Stack tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Next.js | 16 | Framework React (App Router) |
| React | 19 | UI |
| TypeScript | 5 | Tipado estático |
| TailwindCSS | 4 | Estilos |
| Firebase SDK | 12 | Conexión Firestore |
| Recharts | 3 | Gráficos |
| Framer Motion | 12 | Animaciones |
| Lucide React | 1 | Iconos |
| date-fns | 4 | Manipulación de fechas |
